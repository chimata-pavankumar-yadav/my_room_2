import React, { useState ,useEffect} from 'react';
import {View , TouchableOpacity,SafeAreaView, Text, StyleSheet, TextInput, Pressable,Image,Button, StatusBar, ScrollView} from 'react-native';
import DatePicker from 'react-native-date-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import * as SQLite from 'expo-sqlite';
import { Formik } from 'formik';
import * as yup from 'yup';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import ModalDropdown from 'react-native-modal-dropdown';
import DropDownPicker from 'react-native-dropdown-picker';

export default function Groceries_form({navigation,route}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState([]);
  const [data, setData] = useState(['']);
  const [spent,setSpent] = useState(0);
  const [datevisiblity, setDatevisibility] = useState(false);
  const [date, setDate] = useState(null);
  const moment = require('moment');
  const todayDate = moment().format('DD-MM'); // or any other format you prefer
  const [selectedValue, setSelectedValue] = useState('');
  const [image, setImage] = useState(null);
  const [poundData,setPoundData] = useState('');
  const dropData = value.join(',');

  const [items, setItems] = useState([
    {label: 'pavan', value: 'pavan'},
    {label: 'muni', value: 'muni'},
    {label: 'hareesh', value: 'hareesh'},
    {label: 'krishna', value: 'krishna',},
    {label: 'dinesh', value: 'dinesh'},

  ]);
  const db = SQLite.openDatabase("my_room_1.db");

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const datecancel = () => {
    setDatevisibility(false);
}
const dateconfirm = (date) => {
    const date_ = moment(date).format('DD-MM')
    setDate(date_);
    datecancel();
}

const touchshow = () => {
  setDatevisibility(true);
}

const validationSchema = yup.object().shape({
  spent: yup.number().required('rent is required').positive(' rent must be positive number'),
});

useEffect(() => {
  db.transaction(tx => {
    
    tx.executeSql(
      "create table if not exists groceries_details (id integer primary key not null, date date, spent int, pic BLOB, who varchar(255));"
    );
    tx.executeSql(
      "create table if not exists groceries_amount (id integer primary key not null, totalAmount int, spentAmount int);"
    );
    });
    
 },[]);


 const insertDate = date ? date : todayDate;
 
 const submitData = (data) => {


const insertDate = date ? date : todayDate;

db.transaction(tx => {
  if (data) {
    tx.executeSql(
      "insert into groceries_details (date, spent, pic, who) values (?,?,?,?)",
      [insertDate, data.spent, image, dropData],
      (_, insertResult) => {
        // Handle successful insertion
        if (insertResult.rowsAffected > 0) {
          // If the insertion was successful, update groceries_amount
          tx.executeSql(
            'update groceries_amount set totalAmount = totalAmount + ?, spentAmount = spentAmount + ? where id = 1',
            [0, data.spent],
            (_, updateResult) => {
              // Handle successful update
              selectDataFromDatabase(tx);
            },
            (_, updateError) => {
              // Handle error updating groceries_amount
              console.error('Error updating groceries_amount:', updateError);
            }
          );
        } else {
          // Handle case where no rows were affected by the insertion
          console.warn('No rows affected by insertion into groceries_details');
        }
      },
      (_, insertError) => {
        // Handle error inserting into groceries_details
        console.error('Error inserting into groceries_details:', insertError);
      }
    );
  } else {
    // Handle case where data is fals
    tx.executeSql(
      `select * from groceries_details ;`,
      [],
      (_, { rows: { _array } }) => console.log('no data from image'),
      (_, selectError) => {
        // Handle error selecting from groceries_details
        console.error('Error selecting from groceries_details:', selectError);
      }
    );
  }
});

}
const selectDataFromDatabase = (tx) =>{
  tx.executeSql(
    `select * from groceries_details ;`,
    [],
    (_, { rows: { _array } }) => [setData(_array),setImage(null),setValue([])],
);
tx.executeSql(
  `select * from groceries_amount ;`,
  [],
  (_, { rows: { _array } }) => setPoundData(_array),)
}
const [margin, setMargin] = useState(0);
  const handleDropdownOpen = () => {
    setOpen(true);
    setMargin(210); // Adjust this based on your layout requirements
  };

  const handleDropdownClose = () => {
    setOpen(false);
    setMargin(0); // Adjust this based on your layout requirements
  };


  return (
    
    <SafeAreaView style={{flex:1,backgroundColor: '#C1C5D4',}}>
  
    <View style = {styles.formPage}>
   
            <View style={{marginBottom: 20}}>
                <Text style={{color: 'white', fontSize: 25,fontWeight:'bold',}}>
                        Add Groceries Details
                </Text>
          </View>
            
    
          <Formik
        initialValues={{date: { date }['date'], spent: ''}}
        onSubmit={(values, actions) => {
                
                console.log("Form Values:", values); // Debugging: Log form values
                submitData(values);
                actions.resetForm();
                
                }}
        validationSchema={validationSchema}
      >
            {(props) => (
              <View style = {styles.formPage}>
               <TextInput style = {styles.text} 
               inputMode = 'numeric' 
              keyboardType='numbers-and-punctuation' 
              onChangeText={props.handleChange('spent')}
              value={props.values.spent}
              placeholder='Enter spent Amount' />
          <Text style={{ fontSize: 10, color: 'white' }}>{props.touched.spent && props.errors.spent}</Text>

                <DateTimePickerModal
                                    isVisible={datevisiblity}
                                    onConfirm={dateconfirm}
                                    onCancel={datecancel}
                                    mode={'date'}
                                    datePickerModeAndroid={'spinner'}
                                />
                                <View style = {styles.dates}>
                                <View style = {{flexDirection:'row'}}>
                                    <Text style={{ flex: 1, alignItems: 'center',fontSize: 20, color: 'gray',marginLeft:10}} >Tap For Date :</Text>
                                    <TouchableOpacity style={{ justifyContent: 'center', alignItems:'center',flex:1 ,alignSelf:'center'}} onPress={touchshow}>
                                    <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold' }}>{date ? date: todayDate}</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                </View>
                                <View style={{ alignItems: 'center', justifyContent: 'center' ,marginVertical:20}}>
                           <Button title="Click to Upload Bill " onPress={pickImage} />
                         {image && <Image source={{ uri: image }} style={{ width: 185, height: 185 }} />}
                                  </View>

                                  <View style={{ flexDirection:'row', alignItems: 'center', 
                                  justifyContent: 'space-evenly' }}>
                           <View style={{flex:1,alignItems: 'flex-end',marginLeft:10}}>
                                    <Text style={{fontWeight:'bold',fontSize:16}}>Select : </Text>
                                    </View>
                  <View style={{paddingHorizontal:28,flex:2,alignItems: 'flex-start',justifyContent: 'flex-start',marginRight:20}}>
                  <DropDownPicker
                        open={open}
                        value={value} // Pass the value directly
                        items={items}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setItems}
                        multiple={true}
                        mode="BADGE"
                        zIndex={9999}
                        onOpen={handleDropdownOpen}
                        onClose={handleDropdownClose} />
                             </View>
          </View>
          

                               
<View style={{ alignItems: 'center',marginBottom: 80, marginTop:margin}}>
                <View style = {styles.submit}>
                    <Pressable onPress = {props.handleSubmit}>
                        <Text style={{fontSize:20}}>SUBMIT</Text>
                    </Pressable>
                </View>
                <View style = {styles.submit}>
                    <Pressable onPress= {() => navigation.navigate('Groceries',{ data: data})}>
                        <Text style={{fontSize:20}}>Go Back</Text>
                    </Pressable>
                </View>
                </View>
        </View>
            )}
        </Formik>
        </View>     
</SafeAreaView>

  );
}

const styles= StyleSheet.create({
  submit:{
      alignItems:'center',
      justifyContent:'center',
      backgroundColor: 'white',
      borderColor:'white',
      borderWidth:1,
      borderRadius:10,
      width:300,
      height:40,
      marginTop:30,
      shadowColor:'grey',
      shadowOffset:{
        width:0,
        height:5
      },
      shadowOpacity:0.25,
      shadowRadius:3.5,
      elevation:5

  },
  formPage:{
      flex:1,
      justifyContent: 'flex-start',
      alignItems:'center',
      backgroundColor:'#C1C5D4',
  },
  text:{
    fontSize:17,
      textAlign:'center',
      backgroundColor: 'white',
      borderColor:'white',
      borderWidth:1,
      borderRadius:10,
      width:300,
      height:40,
      marginTop:10
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  dates:{
    width:300,
      height:40,
      marginTop:15,
    justifyContent:'center',
      backgroundColor: '#f5f5f5',
      borderRadius:10,
  },container: { 
    width: '10%',
    height:20 // Add padding to the container
  },
  multiSelect: {
    width: '20%',
    height:50// Adjust the width of the multi-select component
  },
})