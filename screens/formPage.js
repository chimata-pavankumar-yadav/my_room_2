import React, { useState ,useEffect} from 'react';
import {View , TouchableOpacity,SafeAreaView, Text, StyleSheet, TextInput, Pressable} from 'react-native';
import DatePicker from 'react-native-date-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import * as SQLite from 'expo-sqlite';
import { Formik } from 'formik';
import * as yup from 'yup';


export default function AddRent({navigation,route}) {
  const db = SQLite.openDatabase("my_room_1.db");
  const [data,setData] = useState([''])
  const [name,setName] = useState('');
  const [rent,setRent] = useState('');
  const [advance,setAdvance] = useState('');
  const [bills,setBills] = useState('');
  const [groceries,setGroceries] = useState('');
  const [datevisiblity, setDatevisibility] = useState(false);
  const [date, setDate] = useState(null);
  const moment = require('moment');
  const todayDate = moment().format('DD-MM'); // or any other format you prefer


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
  name: yup.string().required().min(3),
  rent: yup.number().required('rent is required').positive(' rent must be positive number'),
  bills:yup.number().required('bills amount required').positive(' bills amount must be positive number'),
  groceries:yup.number().required('groceries amount required').positive(' groceries amount must be positive number')

});

useEffect(() => {
  db.transaction(tx => {
    tx.executeSql(
      "create table if not exists groceries_amount (id integer primary key not null, totalAmount int, spentAmount int);"
    );
    tx.executeSql(
      "create table if not exists room_amount (id integer primary key not null, date date, Name varchar(255), rent int, groceries int, bills int, total int );"
    );
    
    });
    
 },[]);

 
 
 const submitData = (data) => {
  const total = parseInt(data.rent)+parseInt(data.bills)+parseInt(data.groceries);
  const insertDate = date ? date : todayDate;

  db.transaction(
      tx => {
          if (data) {
              tx.executeSql("insert into room_amount (date, Name, rent, groceries, bills, total) values (?,?,?,?,?,?)", [insertDate , data.name, data.rent,data.groceries,data.bills,total]);
              tx.executeSql(
                  `select * from room_amount ;`,
                  [],
                  (_, { rows: { _array } }) => setData(_array),
              );
          } else {
              tx.executeSql(
                  `select * from room_amount ;`,
                  [],
                  (_, { rows: { _array } }) => console.log('no data'),
              );
          }

      },
      

  );
}

  return (
    <SafeAreaView style={{flex:1,backgroundColor: '#C1C5D4'}}>
    
    <View style = {styles.formPage}>
            <View style={{marginBottom: 20}}>
                <Text style={{color: 'white', fontSize: 25,fontWeight:'bold',}}>
                        Add Rent Details
                </Text>
          </View>
            
    
          <Formik
        initialValues={{ name: '', rent:'',date: { date }['date'],groceries:'',bills:'' }}
        onSubmit={(values, actions) => {
          submitData(values)
          actions.resetForm();
        }}
        validationSchema={validationSchema}
      >
        
            
            {(props) => (
              <View style = {styles.formPage}>

              <TextInput style = {styles.text} autoCorrect= {false} 
              inputMode = 'text' keyboardType='ascii-capable'  
              placeholder='Enter Full Name' 
              onChangeText={props.handleChange('name')}
              value={props.values.name}
              />
          <Text style={{ fontSize: 10, color: 'white' }}>{props.touched.name && props.errors.name}</Text>
                                  
              <TextInput style = {styles.text} 
               inputMode = 'numeric' 
              keyboardType='numbers-and-punctuation' 
              onChangeText={props.handleChange('rent')}
              value={props.values.rent}
              placeholder='Enter Rent Amount' />
          <Text style={{ fontSize: 10, color: 'white' }}>{props.touched.rent && props.errors.rent}</Text>
                
                <TextInput style = {styles.text}  
                inputMode = 'numeric' 
                keyboardType='numbers-and-punctuation'
                 placeholder='Enter Bills Amount' 
                 onChangeText={props.handleChange('bills')}
                value={props.values.bills}
                 />
                <Text style={{ fontSize: 10, color: 'white' }}>{props.touched.bills && props.errors.bills}</Text>

                <TextInput style = {styles.text}
                 inputMode = 'numeric' 
                 keyboardType='numbers-and-punctuation'
                  placeholder='Enter Groceries Amount'
                  onChangeText={props.handleChange('groceries')}
                value={props.values.groceries} />
                <Text style={{ fontSize: 10, color: 'white' }}>{props.touched.groceries && props.errors.groceries}</Text>

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
                                
               

                <View style = {styles.submit}>
                    <Pressable onPress = {props.handleSubmit}>
                        <Text style={{fontSize:20}}>SUBMIT</Text>
                    </Pressable>
                    
                </View>
                <View style = {styles.submit}>
                    <Pressable onPress= {() => navigation.navigate('Total',{ data: data })}>
                        <Text style={{fontSize:20}}>Go Back</Text>
                    </Pressable>
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
  dates:{
    width:300,
      height:40,
      marginTop:15,
    justifyContent:'center',
      backgroundColor: '#f5f5f5',
      
      
      borderRadius:10,
  }
})