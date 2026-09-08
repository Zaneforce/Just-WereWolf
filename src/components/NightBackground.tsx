import React, { useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { colors } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

function TwinklingStars() {
  const count = 50;
  const stars = useMemo(() => {
    const s = [];
    for (let i = 0; i < count; i++) {
      s.push({
        left: Math.random() * W,
        top: Math.random() * H * 0.6,
        size: Math.random() * 2.5 + 0.5,
        baseOpacity: Math.random() * 0.5 + 0.2,
        delay: Math.random() * 3000,
        duration: 1500 + Math.random() * 2000,
      });
    }
    return s;
  }, []);

  const anims = useRef(stars.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    stars.forEach((s, i) => {
      const twinkle = () => {
        Animated.sequence([
          Animated.timing(anims[i], {
            toValue: 0.2,
            duration: s.duration / 2,
            delay: s.delay,
            useNativeDriver: true,
          }),
          Animated.timing(anims[i], {
            toValue: 1,
            duration: s.duration / 2,
            useNativeDriver: true,
          }),
        ]).start(() => twinkle());
      };
      twinkle();
    });
  }, []);

  return (
    <>
      {stars.map((s, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: s.size / 2,
            backgroundColor: '#fff',
            opacity: anims[i].interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, s.baseOpacity],
            }),
          }}
        />
      ))}
    </>
  );
}

function Moon() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.moonContainer}>
      <Animated.View
        style={[styles.moonGlow, { transform: [{ scale: pulseAnim }] }]}
      />
      <View style={styles.moon} />
    </View>
  );
}

function Treeline() {
  return <View style={styles.treeline} />;
}

export function NightBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bg}>
      <View style={styles.gradientTop} />
      <View style={styles.gradientMid} />
      <View style={styles.gradientBottom} />
      <TwinklingStars />
      <Moon />
      <Treeline />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: colors.bgTop,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: H * 0.33,
    backgroundColor: colors.bgTop,
  },
  gradientMid: {
    position: 'absolute',
    top: H * 0.33,
    left: 0,
    right: 0,
    height: H * 0.33,
    backgroundColor: colors.bgMid,
  },
  gradientBottom: {
    position: 'absolute',
    top: H * 0.66,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgBottom,
  },
  moonContainer: {
    position: 'absolute',
    top: 18,
    right: 20,
    zIndex: 1,
  },
  moonGlow: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.moonGlow,
    position: 'absolute',
    top: -13,
    left: -13,
  },
  moon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.moon,
    shadowColor: colors.moon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 6,
  },
  treeline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: colors.treeline,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 120,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
