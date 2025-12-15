import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';

const {width} = Dimensions.get('window');
const imageSize = (width - 30) / 2;

export default function Search() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const searchPhotos = async (query, pageNum = 1, append = false) => {
    if (!query.trim()) return;
    
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(
        `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s&text=${query}&page=${pageNum}&per_page=20`
      );
      
      if (!response.ok) throw new Error('Network error');
      
      const data = await response.json();
      
      if (data.photos?.photo) {
        const newPhotos = data.photos.photo.filter(photo => photo.url_s);
        
        if (append) {
          setPhotos(prev => [...prev, ...newPhotos]);
        } else {
          setPhotos(newPhotos);
        }
      }
      
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      setLoading(false);
      setLoadingMore(false);
      
      Alert.alert(
        'Network Error',
        'Failed to load photos. Please try again.',
        [
          {text: 'RETRY', onPress: () => searchPhotos(query, pageNum, append)},
          {text: 'Cancel', style: 'cancel'}
        ]
      );
    }
  };

  const handleSearch = () => {
    setPage(1);
    searchPhotos(searchText, 1);
  };

  const clearSearch = () => {
    setSearchText('');
    setPhotos([]);
  };

  const loadMore = () => {
    if (!loadingMore && searchText.trim()) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchPhotos(searchText, nextPage, true);
    }
  };

  const renderPhoto = ({item}) => (
    <TouchableOpacity 
      style={styles.photoContainer}
      onPress={() => setSelectedImage(item.url_s)}
    >
      <Image source={{uri: item.url_s}} style={styles.photo} />
      <Text style={styles.title} numberOfLines={2}>
        {item.title || 'Photo'}
      </Text>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#0066cc" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search photos (cat, dog, nature...)"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          {searchText ? (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={2}
          contentContainerStyle={styles.grid}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            searchText ? (
              <View style={styles.center}>
                <Text>No photos found for "{searchText}"</Text>
              </View>
            ) : (
              <View style={styles.center}>
                <Text>Enter a search term to find photos</Text>
              </View>
            )
          }
        />
      )}
      
      <Modal visible={!!selectedImage} transparent onRequestClose={() => setSelectedImage(null)}>
        <TouchableOpacity 
          style={styles.modalContainer} 
          onPress={() => setSelectedImage(null)}
        >
          <Image source={{uri: selectedImage}} style={styles.fullImage} />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#666',
  },
  searchButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    padding: 10,
  },
  photoContainer: {
    flex: 1,
    margin: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  photo: {
    width: imageSize,
    height: imageSize,
  },
  title: {
    padding: 8,
    fontSize: 12,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 5,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width - 40,
    height: width - 40,
    resizeMode: 'contain',
  },
});