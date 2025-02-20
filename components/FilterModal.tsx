import useFilterStore, { Filters } from "@/hooks/filterStore";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Switch,
  TouchableWithoutFeedback,
} from "react-native";

const FilterModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const filters = useFilterStore((state) => state.filters);
  const setFilters = useFilterStore((state) => state.setFilters);
  const resetFilters = useFilterStore((state) => state.resetFilters);

  const toggleModal = () => setIsModalVisible(!isModalVisible);
  const toggleClose = () => setIsModalVisible(false);

  const handleFilterChange = (filterName: keyof Filters, value: any) => {
    setFilters({
      [filterName]: value,
    });
  };

  const selectedFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === "boolean" && value) count++;
      if (typeof value === "string" && value.trim() !== "") count++;
    });
    return count;
  }, [filters]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.filterButton} onPress={toggleModal}>
        <Text style={styles.filterButtonText}>
          Filters
          {selectedFilterCount > 0 ? `(${selectedFilterCount})` : ""}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filters</Text>
                  <TouchableOpacity onPress={resetFilters}>
                    <Text style={styles.resetText}>Reset</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.filterSection}>
                    <View style={styles.filterOption}>
                      <Text style={styles.filterOptionText}>Mint Auth</Text>
                      <Switch
                        value={filters.mintAuth}
                        onValueChange={(value) =>
                          handleFilterChange("mintAuth", value)
                        }
                        trackColor={{ false: "#2A3F33", true: "#2A3F33" }}
                        thumbColor={filters.mintAuth ? "#8FA396" : "#666"}
                      />
                    </View>
                    <View style={styles.filterOption}>
                      <Text style={styles.filterOptionText}>Freeze Auth</Text>
                      <Switch
                        value={filters.freezeAuth}
                        onValueChange={(value) =>
                          handleFilterChange("freezeAuth", value)
                        }
                        trackColor={{ false: "#2A3F33", true: "#2A3F33" }}
                        thumbColor={filters.freezeAuth ? "#8FA396" : "#666"}
                      />
                    </View>
                    <View style={styles.filterOption}>
                      <Text style={styles.filterOptionText}>LP Burned</Text>
                      <Switch
                        value={filters.lpBurned}
                        onValueChange={(value) =>
                          handleFilterChange("lpBurned", value)
                        }
                        trackColor={{ false: "#2A3F33", true: "#2A3F33" }}
                        thumbColor={filters.lpBurned ? "#8FA396" : "#666"}
                      />
                    </View>
                    <View style={styles.filterOption}>
                      <Text style={styles.filterOptionText}>
                        Top 10 Holders
                      </Text>
                      <Switch
                        value={filters.top10Holders}
                        onValueChange={(value) =>
                          handleFilterChange("top10Holders", value)
                        }
                        trackColor={{ false: "#2A3F33", true: "#2A3F33" }}
                        thumbColor={filters.top10Holders ? "#8FA396" : "#666"}
                      />
                    </View>
                    <View style={styles.filterOption}>
                      <Text style={styles.filterOptionText}>
                        With at least 1 social
                      </Text>
                      <Switch
                        value={filters.withSocial}
                        onValueChange={(value) =>
                          handleFilterChange("withSocial", value)
                        }
                        trackColor={{ false: "#2A3F33", true: "#2A3F33" }}
                        thumbColor={filters.withSocial ? "#8FA396" : "#666"}
                      />
                    </View>
                  </View>
                  <Text style={styles.sectionTitle}>
                    By Current Liquidity ($)
                  </Text>
                  <View style={styles.rangeInput}>
                    <TextInput
                      style={styles.input}
                      placeholder="From"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={filters.liquidityFrom}
                      onChangeText={(value) =>
                        handleFilterChange("liquidityFrom", value)
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="To"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={filters.liquidityTo}
                      onChangeText={(value) =>
                        handleFilterChange("liquidityTo", value)
                      }
                    />
                  </View>

                  <Text style={styles.sectionTitle}>By Volume</Text>
                  <View style={styles.rangeInput}>
                    <TextInput
                      style={styles.input}
                      placeholder="From"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={filters.volumeFrom}
                      onChangeText={(value) =>
                        handleFilterChange("volumeFrom", value)
                      }
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="To"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      value={filters.volumeTo}
                      onChangeText={(value) =>
                        handleFilterChange("volumeTo", value)
                      }
                    />
                  </View>
                </ScrollView>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={toggleClose}
                  >
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={toggleModal}
                  >
                    <Text style={styles.actionButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 0,
    marginBottom: 5,
  },
  filterButton: {
    backgroundColor: "#1A231E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterButtonText: {
    color: "#8FA396",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0A0F0D",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    color: "#8FA396",
    fontWeight: "bold",
  },
  resetText: {
    color: "#8FA396",
    fontSize: 16,
    fontWeight: "bold",
  },
  filterSection: {
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A3F33",
  },
  filterOptionText: {
    color: "#8FA396",
    fontSize: 16,
  },
  sectionTitle: {
    color: "#8FA396",
    marginVertical: 12,
    fontSize: 16,
    fontWeight: "bold",
  },
  rangeInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#1A231E",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A3F33",
    color: "#8FA396",
    padding: 12,
    marginHorizontal: 4,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: "#1A231E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3F33",
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#8FA396",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FilterModal;
