import { useState, useEffect } from "react";
import { SafeAreaView, FlatList, Text, View, ActivityIndicator, RefreshControl } from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import { toggleFavorite, getUserFavorites, getVideosByIds } from "../../lib/appwrite";
import VideoCard from "../../components/VideoCard";
import EmptyState from "../../components/EmptyState";

const Favoritos = () => {
  const { user } = useGlobalContext();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const fetchFavorites = async () => {
    if (user) {
      try {
        const favoriteIds = await getUserFavorites(user.$id);
        console.log('Favorite IDs:', favoriteIds); // Log para verificar los IDs
        if (!favoriteIds || favoriteIds.length === 0) {
          console.log('No favorite IDs found.');
          setVideos([]);
          return;
        }
        const favoriteVideos = await getVideosByIds(favoriteIds);
        console.log('Favorite Videos:', favoriteVideos); // Log para verificar los videos
        setVideos(favoriteVideos);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleToggleFavorite = async (videoId) => {
    if (user) {
      try {
        const updatedFavorites = await toggleFavorite(user.$id, videoId);
        const updatedVideos = await getVideosByIds(updatedFavorites);
        setVideos(updatedVideos);
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    }
  };

  return (
    <SafeAreaView className="px-7 my-6 bg-primary h-full">
      <Text className="font-pmedium my-14 text-sm text-gray-100 text-3xl font-psemibold text-white">Muebles Favoritos</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <VideoCard
              videoId={item.$id}
              title={item.title}
              thumbnail={item.thumbnail}
              video={item.video}
              creator={item.creator.username}
              avatar={item.creator.avatar}
              onToggleFavorite={() => handleToggleFavorite(item.$id)}
            />
          )}
          ListEmptyComponent={() => (
            <EmptyState
              title="Recargue la pagina porfavor"
              subtitle="Aún no has añadido ningún vídeo a tus favoritos"
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Favoritos;
