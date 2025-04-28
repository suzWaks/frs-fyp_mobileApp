import React from "react";
import { View, Text, FlatList, Image } from "react-native";
import { useColorScheme } from "nativewind";
import Svg, { Circle } from "react-native-svg";
import { Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get("window").width;

export default function RealTimeRecord() {
  const { colorScheme } = useColorScheme();

  const data = [
    {
      id: 1,
      name: "Phurba",
      avatar:
        "https://media.istockphoto.com/id/1349231567/vector/young-man-anime-style-character-anime-boy-vector.jpg?s=612x612&w=0&k=20&c=92lg_s72y-gYEfVoWKlq1bzmbWNNI6anQwyhwpMEMiw=",
      status: "correct",
    },
    {
      id: 2,
      name: "Aniketh Pawdel",
      avatar:
        "https://w7.pngwing.com/pngs/531/417/png-transparent-anime-manga-boy-black-hair-human-boy.png",
      status: "correct",
    },
    {
      id: 3,
      name: "Dechen Pelden",
      avatar:
        "https://static.vecteezy.com/system/resources/thumbnails/034/924/233/small_2x/ai-generated-a-girl-looking-out-into-the-clouds-anime-style-ai-generative-photo.jpeg",
      status: "correct",
    },
    {
      id: 4,
      name: "Depashna Pradhan",
      avatar:
        "https://img.freepik.com/premium-photo/portrait-cute-anime-girl-with-black-hair-against-background-beautiful-serene-sky-with-clouds_646632-11707.jpg",
      status: "correct",
    },
    {
      id: 5,
      name: "Jigme Phuentsho Wangyel",
      avatar:
        "https://static.vecteezy.com/system/resources/previews/034/210/205/non_2x/3d-cartoon-baby-genius-photo.jpg",
      status: "wrong",
    },
    {
      id: 6,
      name: "Jimpa Jamtsho",
      avatar:
        "https://static.vecteezy.com/system/resources/thumbnails/028/794/707/small_2x/cartoon-cute-school-boy-photo.jpg",
      status: "correct",
    },
  ];

  const correctCount = data.filter((item) => item.status === "correct").length;
  const totalCount = data.length;
  const correctPercentage = correctCount / totalCount;
  const strokeWidth = 15;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;

  const renderItem = ({ item }) => (
    <View className="flex-row items-center p-3 border-b border-gray-300">
      <Image source={{ uri: item.avatar }} className="w-10 h-10 rounded-full" />
      <View className="ml-3 flex-1">
        <Text
          className={`text-base font-bold ${
            colorScheme === "dark" ? "text-gray-500" : "text-black"
          }`}
        >
          {item.name}
        </Text>
      </View>
      <View className={`w-8 h-8 items-center justify-center rounded-md ${
        item.status === "correct" ? "bg-green-200" : "bg-red-500"
      }`}>
        {item.status === "correct" ? (
          <Ionicons name="checkmark" size={20} color="#28a745" />
        ) : (
          <Ionicons name="close" size={20} color="#FFFFFF" />
        )}
      </View>
    </View>
  );

  return (
    <View
      className={`flex-1 ${
        colorScheme === "dark" ? "bg-gray-900" : "bg-white"
      } p-4`}
    >
      <View>
        <Text
          className={`text-2xl font-bold text-center mb-2 ${
            colorScheme === "dark" ? "text-gray-400" : "text-black"
          }`}
        >
          CTE411
        </Text>

        {/* Attendance Ring */}
        <View className="items-center relative">
          <Svg width={150} height={150} viewBox="0 0 100 100">
            {/* Background Circle */}
            <Circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#E9D5FF"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress Circle */}
            <Circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#7C3AED"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${
                correctPercentage * circumference
              } ${circumference}`}
              strokeLinecap="round"
            />
          </Svg>

          {/* Attendance Count Text in Center */}
          <View
            className="absolute top-1/2 left-1/2"
            style={{ transform: [{ translateX: -20 }, { translateY: -10 }] }}
          >
            <Text
              className={`text-xl font-bold ${
                colorScheme === "dark" ? "text-gray-400" : "text-black"
              }`}
            >
              {correctCount}/{totalCount}
            </Text>
          </View>
        </View>

        <Text
          className={`text-lg text-center mb-1 ${
            colorScheme === "dark" ? "text-gray-500" : "text-black"
          }`}
        >
          10:00 – 12:00 am
        </Text>
        <Text
          className={`text-lg text-center mb-6 ${
            colorScheme === "dark" ? "text-gray-500" : "text-black"
          }`}
        >
          10th June, 2024
        </Text>
        <Text
          className={`text-xl font-bold mb-4 ${
            colorScheme === "dark" ? "text-gray-400" : "text-black"
          }`}
        >
          Real Time Record
        </Text>
      </View>

      {/* List of Members */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="border border-gray-300 rounded-lg mb-5"
      />

      {/* Attendance Summary */}
      <View
        className={`p-4 rounded-lg ${
          colorScheme === "dark" ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        <View className="flex-row justify-between">
          <Text
            className={`text-base ${
              colorScheme === "dark" ? "text-gray-500" : "text-black"
            }`}
          >
            Total present:
          </Text>
          <Text
            className={`text-base font-bold ${
              colorScheme === "dark" ? "text-gray-400" : "text-black"
            }`}
          >
            {correctCount} members
          </Text>
        </View>
        <View className="flex-row justify-between mt-2">
          <Text
            className={`text-base ${
              colorScheme === "dark" ? "text-gray-500" : "text-black"
            }`}
          >
            Total absent:
          </Text>
          <Text
            className={`text-base font-bold ${
              colorScheme === "dark" ? "text-gray-400" : "text-black"
            }`}
          >
            {totalCount - correctCount} members
          </Text>
        </View>
      </View>
    </View>
  );
}