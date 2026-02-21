import React, { useEffect } from "react";
import { View, Text, Image, ImageBackground } from "react-native";
import Mycolors from "../utils/Mycolor";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";

const Splash = () => {
  const nav = useNavigation();
  
  useEffect(() => {
    setTimeout(() => {
      nav.replace('Language');
    }, 5000);
  }, []);
  
  return (
    <ImageBackground
      source={require("../assets/bg.jpg")} // Same background as Signup
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Semi-transparent overlay covering the ENTIRE background - Same as Signup */}
      <View style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(51, 165, 57, 0.6)' // Same light green overlay
      }} />
      
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <StatusBar barStyle="dark-content" />
        
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/splash-icon.png")}
            style={{
              height: 200,
              width: 200,
              marginBottom: -45,
              justifyContent: "center",
            }}
          />
          
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                color: Mycolors.white,
                fontSize: 17,
                textAlign: "center",
                letterSpacing: 2,
                marginTop: 5,
              }}
            >
              Smart Farming Starts Here
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Splash;