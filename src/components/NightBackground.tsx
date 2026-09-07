import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

function Stars() {
  const stars = useMemo(() => {
    const s = [];
    for (let i = 0; i < 60; i++) {
      s.push({
        left: Math.random() * W,
        top: Math.random() * H * 0.7,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }
    return s;
  }, []);

  return (
    <>
      {stars.map((s, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: s.size / 2,
            backgroundColor: colors.star,
            opacity: s.opacity,
          }}
        />
      ))}
    </>
  );
}

function Moon() {
  return (
    <View style={styles.moonContainer}>
      <View style={styles.moonGlow} />
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
      <Stars />
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
    top: 50,
    right: 30,
  },
  moonGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.moonGlow,
    position: 'absolute',
    top: -20,
    left: -20,
  },
  moon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.moon,
    shadowColor: colors.moon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  treeline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: colors.treeline,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 120,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
