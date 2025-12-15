import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');
const imageSize = (width - 30) / 2;

export default function Home() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const cached = await AsyncStorage.getItem('flickr_photos');
      if (cached) {
        setPhotos(JSON.parse(cached));
        setLoading(false);
      }
      
      await fetchPhotos();
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchPhotos = async (pageNum = 1, append = false) => {
    try {
      if (pageNum > 1) setLoadingMore(true);
      
      const response = await fetch(
        `https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=${pageNum}&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s`
      );
      
      if (!response.ok) throw new Error('Network error');
      
      const data = await response.json();
      
      if (data.photos?.photo) {
        const newPhotos = data.photos.photo.filter(photo => photo.url_s);
        
        if (append) {
          setPhotos(prev => [...prev, ...newPhotos]);
        } else {
          const cached = await AsyncStorage.getItem('flickr_photos');
          const cachedPhotos = cached ? JSON.parse(cached) : [];
          
          if (JSON.stringify(newPhotos) !== JSON.stringify(cachedPhotos)) {
            setPhotos(newPhotos);
            await AsyncStorage.setItem('flickr_photos', JSON.stringify(newPhotos));
          }
        }
      }
      
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    } catch (error) {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      
      Alert.alert(
        'Network Error',
        'Failed to load photos. Please try again.',
        [
          {text: 'RETRY', onPress: () => fetchPhotos(pageNum, append)},
          {text: 'Cancel', style: 'cancel'}
        ]
      );
    }
  };

  const loadMore = () => {
    if (!loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPhotos(nextPage, true);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#0066cc" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
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

  if (loading && photos.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            setPage(1);
            fetchPhotos(1);
          }} />
        }
      />
      
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
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 5,
    color: '#666',
  },
});