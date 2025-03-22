import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";

export default function RealTimeRecord() {
  const { colorScheme } = useColorScheme();

  const data = [
    { id: 1, name: "Phurba", avatar: "https://media.istockphoto.com/id/1349231567/vector/young-man-anime-style-character-anime-boy-vector.jpg?s=612x612&w=0&k=20&c=92lg_s72y-gYEfVoWKlq1bzmbWNNI6anQwyhwpMEMiw=", status: "correct" },
    { id: 2, name: "Aniketh Pawdel", avatar: "https://w7.pngwing.com/pngs/531/417/png-transparent-anime-manga-boy-black-hair-human-boy.png", status: "wrong" },
    { id: 3, name: "Dechen Pelden", avatar: "https://static.vecteezy.com/system/resources/thumbnails/034/924/233/small_2x/ai-generated-a-girl-looking-out-into-the-clouds-anime-style-ai-generative-photo.jpeg", status: "correct" },
    { id: 4, name: "Depashna Pradhan", avatar: "https://img.freepik.com/premium-photo/portrait-cute-anime-girl-with-black-hair-against-background-beautiful-serene-sky-with-clouds_646632-11707.jpg", status: "correct" },
    { id: 5, name: "Jigme Phuentsho Wangyel", avatar: "https://static.vecteezy.com/system/resources/previews/034/210/205/non_2x/3d-cartoon-baby-genius-photo.jpg", status: "wrong" },
    { id: 6, name: "Jimpa Jamtsho", avatar: "https://static.vecteezy.com/system/resources/thumbnails/028/794/707/small_2x/cartoon-cute-school-boy-photo.jpg", status: "correct" },
  ];

  const renderItem = ({ item }) => (
    <View className="flex-row items-center p-3 border-b border-gray-300">
      <Image source={{ uri: item.avatar }} className="w-10 h-10 rounded-full" />
      <View className="ml-3 flex-1">
        <Text className="font-bold text-base">{item.name}</Text>
      </View>
      <TouchableOpacity
        className={`w-10 h-10 flex items-center justify-center rounded-md ${item.status === "correct" ? "bg-green-200" : "bg-red-200"}`}
        onPress={() => console.log(`Action for ${item.name}`)}
      >
        <Text className={`text-lg font-bold ${item.status === "correct" ? "text-green-600" : "text-red-600"}`}>
          {item.status === "correct" ? "✓" : "✗"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className={`flex-1 ${colorScheme === "dark" ? "bg-gray-900" : "bg-white"} p-4`}>
      <View>
        <Text className="text-2xl font-bold text-center mb-2">CTE411</Text>
        <Text className="text-lg text-center mb-1">10:00 – 12:00 am</Text>
        <Text className="text-lg text-center mb-6">10th June, 2024</Text>
        <Text className="text-xl font-bold mb-4">Real Time Record</Text>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="border border-gray-300 rounded-lg mb-5"
      />
      <View className="bg-gray-200 p-4 border-t border-gray-200 rounded-lg">
        <View className="flex-row justify-between">
          <Text className="text-base">Total present:</Text>
          <Text className="text-base font-bold">36 members</Text>
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="text-base">Total absent:</Text>
          <Text className="text-base font-bold">3 members</Text>
        </View>
      </View>
    </View>
  );
}
