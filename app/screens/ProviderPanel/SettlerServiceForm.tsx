import { View, Text, ScrollView, TouchableOpacity, Image, Linking, Alert, ActivityIndicator, TextInput, RefreshControl } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { COLORS, SIZES } from '../../constants/theme';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/RootStackParamList';
import Input from '../../components/Input/Input';
import Ionicons from '@react-native-vector-icons/ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import { CategoryDropdown } from '../../components/CategoryDropdown';
import { createSettlerService, deleteSettlerService, fetchSelectedSettlerService, updateSettlerService, uploadImages } from '../../services/SettlerServiceServices';
import { useUser } from '../../context/UserContext';
import { Catalogue, fetchAllCatalogue } from '../../services/CatalogueServices';
import { serviceLocation } from '../../constants/ServiceLocation';
import AttachmentForm from '../../components/Forms/AttachmentForm';
import { fetchSystemParameters, ServiceArea, ServiceCategory } from '../../services/SystemParameterServices';

type SettlerServiceFormScreenProps = StackScreenProps<RootStackParamList, 'SettlerServiceForm'>

export const SettlerServiceForm = ({ navigation, route }: SettlerServiceFormScreenProps) => {
  const { user, updateUserData } = useUser();


  const [settlerService, setSettlerService] = useState(route.params.settlerService);
  const [selectedServiceCardImageUrls, setSelectedServiceCardImageUrls] = useState<string | null>(null);
  const [serviceCardImageUrls, setServiceCardImageUrls] = useState<string[]>([]);
  const [serviceCardBrief, setServiceCardBrief] = useState<string>('');
  const [isAvailableImmediately, setIsAvailableImmediately] = useState(false);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [serviceStartTime, setServiceStartTime] = useState<string>('');
  const [serviceEndTime, setServiceEndTime] = useState<string>('');

  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const [refreshing, setRefreshing] = useState(false);
  const [isFocused2, setisFocused2] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(false);

  const [index, setIndex] = useState(0);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [category, setCategory] = useState<string>('');
  const [catalogue, setCatalogue] = useState<Catalogue[]>();
  const [selectedCatalogue, setSelectedCatalogue] = useState<Catalogue>();
  const [loading, setLoading] = useState(false);

  const handleListing = async () => {
    setLoading(true);
    try {
      // 🔹 UPDATE existing service
      if (settlerService) {

        // upload image and get url
        const imageUrls = await uploadImages(settlerService?.id || '', serviceCardImageUrls);

        await updateSettlerService(settlerService.id || '', {
          settlerId: user?.uid || '',
          settlerFirstName: user?.firstName || '',
          settlerLastName: user?.lastName || '',
          selectedCatalogue: selectedCatalogue,
          serviceCardImageUrls: imageUrls,
          serviceCardBrief,
          isAvailableImmediately,
          availableDays,
          serviceStartTime,
          serviceEndTime,
          serviceLocation: selectedLocation,
          isActive,
        });
        Alert.alert('Settler service updated successfully.');
      } else if (!settlerService) {
        if (!selectedCatalogue || !selectedLocation) {
          Alert.alert('Error', 'Please select a category and location.');
          return;
        }

        if (selectedCatalogue && selectedLocation) {
          await createSettlerService({
            settlerId: user?.uid || '',
            settlerFirstName: user?.firstName || '',
            settlerLastName: user?.lastName || '',
            selectedCatalogue,
            serviceCardImageUrls,
            serviceCardBrief,
            isAvailableImmediately,
            availableDays,
            serviceStartTime,
            serviceEndTime,
            serviceLocation: selectedLocation,
            qualifications: [],
            isActive,
            jobsCount: 0,
            averageRatings: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          Alert.alert('Settler service created successfully.');
        }
      }

      // Update user's activeJobs without duplication. Each job: { catalogueId, settlerServiceId }
      const existingActiveJobs = Array.isArray(user?.activeJobs) ? user!.activeJobs : [];
      const catalogueId = selectedCatalogue?.id || '';
      const settlerServiceId = settlerService?.id || '';

      if (isActive) {
        // Only add when we have both ids and the exact pair doesn't already exist
        if (catalogueId && settlerServiceId) {
          const alreadyExists = existingActiveJobs.some(
            (job: any) =>
              job.catalogueId === catalogueId && job.settlerServiceId === settlerServiceId
          );

          if (!alreadyExists) {
            await updateUserData(user?.uid || '', {
              activeJobs: [...existingActiveJobs, { catalogueId, settlerServiceId }],
            });
          }
        }
      } else {
        // Remove any entries for this settlerServiceId (or for the catalogue if you prefer)
        const filtered = existingActiveJobs.filter(
          (job: any) => job.settlerServiceId !== settlerServiceId
        );
        await updateUserData(user?.uid || '', { activeJobs: filtered });
      }
    } catch (error) {
      console.error('Error handling settler service listing:', error);
      Alert.alert('Error', 'There was an error processing your request. Please try again.');
    }
  }

  const toggleDaySelection = (day: string) => {
    setAvailableDays((prevSelectedDays) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d) => d !== day)
        : [...prevSelectedDays, day]
    );
  };

  const fetchData = async () => {

    // Fetch system parameters for service categories
    const systemParameters = await fetchSystemParameters();
    if (systemParameters.settlerResources) {
      setCategories(systemParameters.serviceCategories)
    }

    // Fetch system parameters for service areas
    if (systemParameters.serviceAreas) {
      setServiceAreas(systemParameters.serviceAreas);
    }


    const allCatalogue = await fetchAllCatalogue();
    setCatalogue(allCatalogue);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedServiceCardImageUrls(settlerService?.serviceCardImageUrls[0] || null);
    setServiceCardImageUrls(settlerService?.serviceCardImageUrls || []);
    setServiceCardBrief(settlerService?.serviceCardBrief || '');
    setIsAvailableImmediately(settlerService?.isAvailableImmediately || false);
    setAvailableDays(settlerService?.availableDays || []);
    setServiceStartTime(settlerService?.serviceStartTime || '');
    setServiceEndTime(settlerService?.serviceEndTime || '');
    setSelectedLocation(settlerService?.serviceLocation || '');
    setIsActive(settlerService?.isActive || false);
    setSelectedCatalogue(settlerService?.selectedCatalogue)
  }, [settlerService])

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, [settlerService]);

  return (
    <View style={{ backgroundColor: COLORS.background, flex: 1 }}>
      <View style={{
        zIndex: 1,
        height: 60,
        backgroundColor: COLORS.background,
        borderBottomColor: COLORS.card,
        borderBottomWidth: 1,
      }}>
        <View style={{
          height: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
          paddingTop: 8,
        }}>
          <TouchableOpacity
            style={{ padding: 8 }}
            onPress={() => {
              if (index === 0) navigation.goBack();
              else if (index === 4) setIndex(0);
              else setIndex(prev => Math.max(prev - 1, 0))
            }}
          >
            <Ionicons name="chevron-back-outline" size={28} color={COLORS.title} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: COLORS.title,
            textAlign: 'center',
          }}>Manage Service</Text>
          {settlerService ? (
            <TouchableOpacity
              style={{
                borderRadius: 50,
                padding: 10,
              }}
              onPress={() =>
                deleteSettlerService(settlerService?.id || '').then(() => navigation.goBack())
              }
            >
              <Ionicons name="trash-outline" size={25} color={COLORS.title} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 250 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View>
          {index === 0 && (
            <View style={{ paddingTop: 20, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: '90%' }}>
                <View style={{ backgroundColor: COLORS.card, padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: COLORS.inputBorder }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: COLORS.title, fontWeight: '700' }}>NOTE</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: COLORS.black, marginTop: 6, lineHeight: 18 }}>
                    If you can't see any active job requests, it's recommended to toggle the job active status again (even if it already shows active).
                  </Text>
                </View>
                <View style={{ paddingTop: 15 }}>
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      borderWidth: 0.6,
                      borderColor: COLORS.blackLight,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}
                    onPress={() => setIndex(1)}
                  >
                    <Ionicons name="briefcase-outline" size={26} color={COLORS.blackLight} style={{ margin: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.title }}>
                        {selectedCatalogue ? selectedCatalogue.title : `Select a service`}
                      </Text>
                      <Text style={{ fontSize: 13, color: COLORS.black }}>
                        {selectedCatalogue ? selectedCatalogue.category : `You need to select available services from catalogue`}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={26} color={COLORS.blackLight} style={{ margin: 5 }} />
                  </TouchableOpacity>
                </View>
                {
                  (settlerService) && (
                    <View style={{ flex: 1, flexDirection: 'row', marginTop: 15, marginBottom: 5 }}>
                      <Text style={{ fontSize: 16, color: COLORS.title, fontWeight: 'bold', marginRight: 10 }}>Settler Service Id:</Text>
                      <Text>{settlerService.id}</Text>
                    </View>
                  )
                }
                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 10, }}>
                  <View style={[GlobalStyleSheet.line]} />
                  <AttachmentForm
                    title="Service Card Image"
                    description="Upload your service card image here."
                    showRemark={false}
                    isEditable={loading ? false : true}
                    initialImages={settlerService?.serviceCardImageUrls || []}
                    onChange={(data) => {
                      setServiceCardImageUrls(data.images)
                    }}
                  />
                </View>
                <Text style={{ fontSize: 16, color: COLORS.title, fontWeight: 'bold', marginTop: 15, marginBottom: 5 }}>Card Bio. / Brief</Text>
                <Input
                  onFocus={() => setisFocused2(true)}
                  onBlur={() => setisFocused2(false)}
                  isFocused={isFocused2}
                  value={serviceCardBrief}
                  onChangeText={setServiceCardBrief}
                  backround={COLORS.card}
                  style={{
                    fontSize: 12,
                    borderRadius: 12,
                    backgroundColor: COLORS.input,
                    borderColor: COLORS.inputBorder,
                    borderWidth: 1,
                    height: 80,
                  }}
                  inputicon
                  placeholder='e.g. General cleaning is a light cleaning job etc'
                  multiline={true}
                  numberOfLines={4}
                />
                <Text style={{ fontSize: 16, color: COLORS.title, fontWeight: 'bold', marginTop: 15, marginBottom: 5 }}>Able to receive job immediately?</Text>
                <CategoryDropdown
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' }
                  ]}
                  selectedOption={isAvailableImmediately ? 'Yes' : 'No'}
                  setSelectedOption={(value: string) => setIsAvailableImmediately(value === 'Yes')}
                />
                <Text style={{ fontSize: 16, color: COLORS.title, fontWeight: 'bold', marginTop: 15, marginBottom: 5 }}>Job availability</Text>
                {settlerService && settlerService.availableDays && (
                  <View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 20, gap: 10 }}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <TouchableOpacity
                          key={index}
                          style={{
                            borderRadius: 10,
                            backgroundColor: availableDays.includes(day) ? COLORS.primary : COLORS.input,
                            padding: 10,
                            alignItems: 'center',
                            width: '30%',
                            marginBottom: 10
                          }}
                          onPress={() => toggleDaySelection(day)}
                        >
                          <Text style={{ fontSize: 14, color: COLORS.title }}>{day}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                <Text style={{ fontSize: 16, color: COLORS.title, fontWeight: 'bold', marginTop: 15, marginBottom: 5 }}>Preferred Job Time</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 14, color: COLORS.title, fontWeight: 'bold', marginBottom: 5 }}>Start Time</Text>
                    <Input
                      onFocus={() => setisFocused2(true)}
                      onBlur={() => setisFocused2(false)}
                      isFocused={isFocused2}
                      backround={COLORS.card}
                      value={serviceStartTime}
                      onChangeText={setServiceStartTime}
                      style={{
                        borderRadius: 12,
                        backgroundColor: COLORS.input,
                        borderColor: COLORS.inputBorder,
                        borderWidth: 1,
                        height: 50,
                      }}
                      placeholder='e.g. 09:00'
                      keyboardType={'numeric'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, color: COLORS.title, fontWeight: 'bold', marginBottom: 5 }}>End Time</Text>
                    <Input
                      onFocus={() => setisFocused2(true)}
                      onBlur={() => setisFocused2(false)}
                      isFocused={isFocused2}
                      backround={COLORS.card}
                      value={serviceEndTime}
                      onChangeText={setServiceEndTime}
                      style={{
                        borderRadius: 12,
                        backgroundColor: COLORS.input,
                        borderColor: COLORS.inputBorder,
                        borderWidth: 1,
                        height: 50,
                      }}
                      placeholder='e.g. 18:00'
                      keyboardType={'numeric'}
                    />
                  </View>
                </View>
                <Text style={{ fontSize: 16, color: COLORS.title, fontWeight: 'bold', marginTop: 15, marginBottom: 5 }}>Service Address</Text>
                <View>
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      borderWidth: 0.6,
                      borderColor: COLORS.blackLight,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}
                    onPress={() => setIndex(4)}
                  >
                    <Ionicons name="location-outline" size={26} color={COLORS.blackLight} style={{ margin: 5 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.title }}>
                        Service at {selectedLocation ? selectedLocation : `Address`}
                      </Text>
                      <Text style={{ fontSize: 13, color: COLORS.black }}>
                        {selectedLocation ? selectedLocation : `No address selected`}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={26} color={COLORS.blackLight} style={{ margin: 5 }} />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 16, color: COLORS.title, fontWeight: 'bold', marginTop: 15, marginBottom: 5 }}>Job Availability Status:</Text>
                <CategoryDropdown
                  options={[
                    { label: 'Active', value: 'Yes' },
                    { label: 'Inactive', value: 'No' }
                  ]}
                  selectedOption={isActive ? 'Yes' : 'No'}
                  setSelectedOption={(value: string) => setIsActive(value === 'Yes')}
                />
              </View>
              <View style={[GlobalStyleSheet.container, { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 30 }]}>
                <TouchableOpacity
                  style={{
                    backgroundColor: COLORS.primary,
                    padding: 15,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}
                  onPress={() => {
                    handleListing();
                    navigation.goBack();
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    {settlerService ? 'Update Service Info' : 'Submit Service'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* Category Selection */}
          {index === 1 &&
            <View style={[GlobalStyleSheet.container, { paddingHorizontal: 15, flexDirection: 'row', flexWrap: 'wrap' }]}>
              {categories.map((categoryData, index) => (
                <TouchableOpacity
                  key={index} style={{ width: '50%', padding: 10 }}
                  onPress={() => {
                    setCategory(categoryData.value)
                    setIndex(2)
                  }}
                >
                  <View style={{
                    height: 150,
                    borderColor: category.includes(categoryData.value) ? COLORS.primary : COLORS.blackLight,
                    borderWidth: 2,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10,
                    backgroundColor: category.includes(categoryData.value) ? COLORS.card : COLORS.background
                  }}>
                    <Image source={{ uri: categoryData.imageUrl }} style={{ width: '100%', height: 70, resizeMode: 'contain' }} />
                    <Text style={{ fontSize: 14, color: COLORS.blackLight, textAlign: 'center', marginTop: 10 }}>{categoryData.value}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          }
          {/* Task Selection */}
          {index === 2 &&
            <View style={[GlobalStyleSheet.container, { paddingHorizontal: 25, paddingBottom: 100 }]}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.black, paddingTop: 30, paddingBottom: 10 }}>Select tasks that you can offer</Text>
              {catalogue && catalogue
              .filter(option => option.category === category)
              .map((option) => (
                <TouchableOpacity
                key={option.id}
                style={{
                  backgroundColor: COLORS.card,
                  borderRadius: 12,
                  padding: 16,
                  marginVertical: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: COLORS.inputBorder,
                }}
                onPress={() => {
                  setSelectedCatalogue(option)
                  setIndex(3)
                }}
                >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.title }}>{option.title}</Text>
                  <Ionicons name={option.isActive ? 'checkmark-circle' : 'close-circle'} size={18} color={option.isActive ? COLORS.primary : COLORS.blackLight} style={{ marginLeft: 8 }} />
                  </View>
                  <Text style={{ fontSize: 13, color: COLORS.black, marginBottom: 8 }}>{option.description}</Text>
                  {option.imageUrls && option.imageUrls.length > 0 && (
                  <Image
                    source={{ uri: option.imageUrls[0] }}
                    style={{ width: 60, height: 60, borderRadius: 8, marginTop: 4 }}
                    resizeMode="cover"
                  />
                  )}
                </View>
                <Ionicons name={'chevron-forward'} size={28} color={COLORS.black} style={{ marginLeft: 10 }} />
                </TouchableOpacity>
              ))}
            </View>
          }
          {/* Task Details */}
          {index === 3 && (
            <View style={{ paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center' }}>
              <AttachmentForm
                title={selectedCatalogue?.title || ''}
                description={selectedCatalogue?.description || ''}
                initialImages={selectedCatalogue?.imageUrls}
                showRemark={false}
                isEditable={false}
              />
              <View style={{ alignItems: 'flex-start' }}>
                <View style={{
                  width: '100%',
                  backgroundColor: COLORS.card,
                  borderRadius: 12,
                  padding: 15,
                  marginVertical: 12,
                  // shadow
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ width: 6, height: 24, borderRadius: 4, backgroundColor: COLORS.primary, marginRight: 10 }} />
                    <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.title }}>What's Included</Text>
                  </View>
                  <Text style={{ fontSize: 14, color: COLORS.black, lineHeight: 20, marginBottom: 12 }}>
                    {selectedCatalogue?.includedServices || 'No details provided.'}
                  </Text>

                  <View style={{ height: 1, backgroundColor: COLORS.inputBorder, marginVertical: 8, borderRadius: 1 }} />

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 6 }}>
                    <View style={{ width: 6, height: 24, borderRadius: 4, backgroundColor: COLORS.secondary || COLORS.blackLight, marginRight: 10 }} />
                    <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.title }}>What's Excluded</Text>
                  </View>
                  <Text style={{ fontSize: 14, color: COLORS.black, lineHeight: 20 }}>
                    {selectedCatalogue?.excludedServices || 'No exclusions specified.'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIndex(0)}
                style={{ width: SIZES.width * 0.8, backgroundColor: COLORS.primary, borderRadius: 12, padding: 15 }}>
                <Text style={{ color: COLORS.white, textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>Select this Service</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Location Selection */}
          {index === 4 && (
            <View style={{ flex: 1, padding: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.title, marginBottom: 20 }}>Select where to do the service</Text>
              <View style={{ paddingLeft: 10 }}>
                {serviceAreas.map((location, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    style={{
                      padding: 15,
                      borderColor: selectedLocation === location.name ? COLORS.primary : COLORS.blackLight,
                      borderRadius: 10,
                      borderWidth: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}
                    onPress={() => {
                      setSelectedLocation(location.name);
                      setIndex(0)
                    }}
                  >
                    <Ionicons name="location-outline" size={30} color={COLORS.blackLight} style={{ margin: 5 }} />
                    <View style={{ flex: 1, paddingLeft: 10 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.title }}>
                        {location.name || `Address ${index + 1}`}
                      </Text>
                      <Text style={{ fontSize: 13, color: COLORS.black }}>
                        Postcodes: {location.postcodePrefixes}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SettlerServiceForm