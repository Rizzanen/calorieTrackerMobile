import { StyleSheet, Text, View, Animated, TextInput } from "react-native";
import React, { useRef } from "react";
import Svg, { G, Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedInput = Animated.createAnimatedComponent(TextInput);

export default function DoughnutChart({
  percentage = 33,
  //radius of the circle
  radius = 80,
  //the doughnut lines width
  strokeWidth = 20,
  duration = 1500,
  color = "#90E0EF",
  delay = 0,
  textColor,
  max = 100,
  text = "",
}) {
  const inputRef = React.useRef();
  const circleRef = React.useRef();
  const halfCircle = radius + strokeWidth;
  const circleCircumfrence = 2 * Math.PI * radius;
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const animation = (toValue) => {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    animation(percentage);

    animatedValue.addListener((v) => {
      if (circleRef?.current) {
        const maxPercentage =
          isNaN(v.value) || isNaN(max)
            ? 0
            : v.value > max
            ? 100
            : (v.value * 100) / max;
        const strokeDashoffset =
          circleCircumfrence - (circleCircumfrence * maxPercentage) / 100;
        circleRef.current.setNativeProps({ strokeDashoffset });
      }

      if (inputRef?.current) {
        inputRef.current.setNativeProps({
          text: `${Math.round(v.value)} ${text}`,
        });
      }
    });
    return () => {
      animatedValue.removeAllListeners();
    };
  }, [max, percentage]);
  return (
    <View>
      <Svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      >
        {/*turn the starting point of the circle from right to top*/}
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          <Circle
            cx="50%"
            cy="50%"
            stroke={color}
            strokeWidth={strokeWidth}
            r={radius}
            strokeOpacity={0.2}
            fill={"transparent"}
          />
          <AnimatedCircle
            ref={circleRef}
            cx="50%"
            cy="50%"
            stroke={color}
            strokeWidth={strokeWidth}
            r={radius}
            fill={"transparent"}
            strokeDasharray={circleCircumfrence}
            strokeDashoffset={circleCircumfrence / 2}
            strokeLinecap="round" /*makes the end of the lines rounded*/
          />
        </G>
      </Svg>
      <AnimatedInput
        ref={inputRef}
        underlineColorAndroid="transparent"
        editable={false}
        defaultValue="0"
        style={[
          StyleSheet.absoluteFillObject,
          { fontSize: radius / 4, color: "#CAF0F8" },
          { fontWeight: "900", textAlign: "center" },
        ]}
      />
    </View>
  );
}
