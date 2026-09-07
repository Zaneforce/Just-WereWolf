import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Player, NightStep, NightResult, RoleId } from '../types';
import { colors, shared, ROLE_DEFS } from '../theme';
import { GoldButton } from './GoldButton';

interface Props {
  players: Player[];
  round: number;
  nightStep: NightStep;
  nightResult: NightResult;
  hasRole: (role: RoleId) => boolean;
  lastGuardTarget: number | null;
  onSelectTarget: (playerId: number) => void;
  onAdvanceStep: () => void;
}

export function NightPhase({
  players,
  round,
  nightStep,
  nightResult,
  hasRole,
  lastGuardTarget,
  onSelectTarget,
  onAdvanceStep,
}: Props) {
  const alive = players.filter((p) => p.alive);

  const renderNarration = (text: string) => (
    <Text style={styles.narration}>{text}</Text>
  );

  const renderPlayerList = (
    exclude?: RoleId,
    selectedId?: number | null,
    excludeId?: number | null,
  ) => {
    let targets = alive;
    if (exclude) targets = targets.filter((p) => p.role !== exclude);
    if (excludeId !== undefined && excludeId !== null) {
      targets = targets.filter((p) => p.id !== excludeId);
    }
    return (
      <FlatList
        data={targets}
        keyExtractor={(p) => p.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isSelected = selectedId === item.id;
          return (
            <TouchableOpacity
              style={[
                styles.targetItem,
                isSelected && styles.targetSelected,
              ]}
              onPress={() => onSelectTarget(item.id)}
            >
              <Text
                style={[
                  styles.targetText,
                  isSelected && styles.targetTextSelected,
                ]}
              >
                {item.name}
              </Text>
              {isSelected && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  const renderContent = () => {
    switch (nightStep) {
      case 'intro':
        return (
          <View style={styles.centered}>
            <Text style={styles.nightIcon}>🌙</Text>
            {renderNarration(
              `Malam ke-${round} tiba.\nSemua pemain, pejamkan mata.`,
            )}
            <GoldButton label="Lanjut" onPress={onAdvanceStep} style={styles.btn} />
          </View>
        );

      case 'serigala':
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: ROLE_DEFS.serigala.color }]}>
              🐺 Serigala
            </Text>
            {renderNarration(
              '"Serigala, buka mata dan pilih mangsa kalian."',
            )}
            <Text style={styles.instruction}>Pilih target:</Text>
            {renderPlayerList('serigala', nightResult.wolfTarget)}
            <GoldButton
              label="Konfirmasi"
              onPress={onAdvanceStep}
              disabled={nightResult.wolfTarget === null}
              style={styles.btn}
            />
          </View>
        );

      case 'peramal':
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: ROLE_DEFS.peramal.color }]}>
              🔮 Peramal
            </Text>
            {renderNarration(
              '"Peramal, buka mata. Pilih 1 pemain untuk diintip."',
            )}
            {nightResult.seerResult ? (
              <View style={[shared.card, styles.seerResult]}>
                <Text style={styles.seerLabel}>Hasil intipan:</Text>
                <Text
                  style={[
                    styles.seerRole,
                    { color: ROLE_DEFS[nightResult.seerResult].color },
                  ]}
                >
                  {ROLE_DEFS[nightResult.seerResult].emoji}{' '}
                  {ROLE_DEFS[nightResult.seerResult].name}
                </Text>
                <Text style={shared.textDim}>
                  (Hanya Operator yang melihat ini)
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.instruction}>Pilih target:</Text>
                {renderPlayerList('peramal', nightResult.seerTarget)}
              </>
            )}
            <GoldButton
              label={nightResult.seerResult ? 'Lanjut' : 'Intip'}
              onPress={onAdvanceStep}
              disabled={!nightResult.seerResult && nightResult.seerTarget === null}
              style={styles.btn}
            />
          </View>
        );

      case 'pelindung':
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: ROLE_DEFS.pelindung.color }]}>
              🛡️ Pelindung
            </Text>
            {renderNarration(
              '"Pelindung, buka mata. Pilih 1 pemain untuk dilindungi."',
            )}
            <Text style={styles.instruction}>
              Pilih target:{lastGuardTarget !== null ? '\n(Tidak boleh sama dengan malam sebelumnya)' : ''}
            </Text>
            {renderPlayerList(undefined, nightResult.guardTarget, lastGuardTarget)}
            <GoldButton
              label="Konfirmasi"
              onPress={onAdvanceStep}
              disabled={nightResult.guardTarget === null}
              style={styles.btn}
            />
          </View>
        );

      case 'outro':
        return (
          <View style={styles.centered}>
            <Text style={styles.nightIcon}>😴</Text>
            {renderNarration(
              '"Semua tutup mata.\nMalam telah berakhir. Bersiap menyambut pagi."',
            )}
            <GoldButton label="Lihat Hasil Malam" onPress={onAdvanceStep} style={styles.btn} />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={shared.title}>Malam ke-{round}</Text>
      <OperatorPanel players={players} />
      {renderContent()}
    </ScrollView>
  );
}

function OperatorPanel({ players }: { players: Player[] }) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <View style={[shared.card, styles.operatorPanel]}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <Text style={styles.operatorTitle}>
          {expanded ? '▼' : '▶'} Daftar Role (Operator)
        </Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.roleList}>
          {players.map((p) => {
            const def = ROLE_DEFS[p.role];
            return (
              <View key={p.id} style={styles.roleListItem}>
                <Text
                  style={[
                    styles.roleListName,
                    !p.alive && styles.deadPlayer,
                  ]}
                >
                  {p.alive ? '' : '💀 '}{p.name}
                </Text>
                <View style={[shared.badge, { backgroundColor: def.color }]}>
                  <Text style={shared.badgeText}>
                    {def.emoji} {def.name}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  nightIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  narration: {
    fontSize: 18,
    color: colors.moon,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  stepContainer: {
    paddingVertical: 12,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  instruction: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  targetItem: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetSelected: {
    borderColor: colors.moon,
    backgroundColor: 'rgba(243,220,148,0.1)',
  },
  targetText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  targetTextSelected: {
    color: colors.moon,
    fontWeight: 'bold',
  },
  checkMark: {
    color: colors.moon,
    fontSize: 18,
    fontWeight: 'bold',
  },
  btn: {
    marginTop: 16,
    alignSelf: 'center',
    minWidth: 200,
  },
  seerResult: {
    alignItems: 'center',
    marginVertical: 12,
  },
  seerLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  seerRole: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  operatorPanel: {
    marginBottom: 8,
  },
  operatorTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  roleList: {
    marginTop: 8,
  },
  roleListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  roleListName: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  deadPlayer: {
    color: colors.textDim,
    textDecorationLine: 'line-through',
  },
});
