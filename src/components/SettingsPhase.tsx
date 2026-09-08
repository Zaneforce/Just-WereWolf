import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { SimpleSlider } from './SimpleSlider';
import { colors, shared } from '../theme';
import { GoldButton } from './GoldButton';
import { FadeIn } from './FadeIn';
import { feedback } from '../sounds';
import {
  getVoiceEnabled,
  getVoiceRate,
  setVoiceEnabled,
  setVoiceRate,
  speak,
} from '../audio/narrator';

interface Props {
  onBack: () => void;
}

export function SettingsPhase({ onBack }: Props) {
  const [enabled, setEnabled] = useState(getVoiceEnabled());
  const [rate, setRate] = useState(getVoiceRate());

  useEffect(() => {
    setVoiceEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    setVoiceRate(rate);
  }, [rate]);

  const testVoice = async () => {
    feedback('tap');
    await speak('Malam tiba. Semua pemain, pejamkan mata.');
  };

  return (
    <View style={styles.container}>
      <FadeIn delay={0} slideFrom="none">
        <Text style={shared.title}>Pengaturan Suara</Text>
      </FadeIn>

      <FadeIn delay={100}>
        <View style={[shared.card, styles.settingRow]}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Narasi Suara</Text>
            <Text style={shared.textDim}>
              {enabled ? 'Aktif — HP akan berbicara' : 'Nonaktif — teks saja'}
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={(v) => {
              feedback('select');
              setEnabled(v);
            }}
            trackColor={{ false: colors.cardBorder, true: colors.moon }}
            thumbColor={enabled ? '#fff' : colors.textDim}
          />
        </View>
      </FadeIn>

      <FadeIn delay={200}>
        <View style={shared.card}>
          <Text style={styles.settingLabel}>Kecepatan Bicara</Text>
          <Text style={[shared.textDim, { marginBottom: 8 }]}>
            {rate.toFixed(1)}x {rate < 0.8 ? '(Lambat)' : rate > 1.3 ? '(Cepat)' : '(Normal)'}
          </Text>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>0.5x</Text>
            <View style={styles.sliderWrapper}>
              <SimpleSlider
                minimumValue={0.5}
                maximumValue={2.0}
                step={0.1}
                value={rate}
                onValueChange={setRate}
                disabled={!enabled}
              />
            </View>
            <Text style={styles.sliderLabel}>2.0x</Text>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={300}>
        <GoldButton
          label="🔊 Tes Suara"
          onPress={testVoice}
          disabled={!enabled}
          style={styles.testBtn}
        />
      </FadeIn>

      <FadeIn delay={400}>
        <View style={[shared.card, styles.infoCard]}>
          <Text style={styles.infoTitle}>💡 Tips</Text>
          <Text style={shared.textDim}>
            Jika suara tidak keluar, buka Setelan Android → Bahasa & Input → Text-to-Speech → pastikan engine TTS aktif dan bahasa Indonesia terinstall.
          </Text>
        </View>
      </FadeIn>

      <FadeIn delay={500}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>← Kembali</Text>
        </Pressable>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderWrapper: {
    flex: 1,
  },
  sliderLabel: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
  },
  testBtn: {
    alignSelf: 'center',
    marginTop: 8,
    minWidth: 180,
  },
  infoCard: {
    marginTop: 4,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  backBtn: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
