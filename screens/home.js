import { NavigationContainer,useFocusEffect  } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { Component,useEffect,useState,useCallback } from 'react';
import {TouchableWithoutFeedback, TouchableOpacity,StyleSheet, ScrollView, Text, View, Pressable, Button ,SafeAreaView} from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
//import { BarChart, LineChart, PieChart, PopulationPyramid } from "react-native-gifted-charts";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import { Alert } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import moment from 'moment';
import * as SQLite from 'expo-sqlite';
import { insert } from 'formik';
import { Formik } from 'formik';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

export default function Home({ navigation }) {

  
  const db = SQLite.openDatabase("my_room_1.db");
  const today = moment().format('DD-MM');
  const [database, setDatabase] = useState('');
  
  const [rentDate,setRentDate]  = useState(null);  
  const [totalNumberOfDay,setTotalNumberOfDay] = useState(0);
  const [days_remaining, setDays_remaining]= useState(0);
 
  const [daysHappened, setDaysHappened] = useState(0);
  const [datevisiblity, setDatevisibility] = useState(false);

  const [futureDate,setFutureDate] = useState(moment());
  const[totalAmount, setTotalAmount] = useState(0);
  const[spentAmount, setSpentAmount] = useState(0);
  

  useEffect(() => {
    fetchData();
  }, []);

  

  const datecancel = () => {
    setDatevisibility(false);
}
const dateconfirm = (date) => {

    const date_ = moment(date).format('DD-MM')
    setRentDate(date_); 
   
    
   
    db.transaction((tx) => {
      updateRowInDatabase(tx,date_);
  });
    
    datecancel();
}

const touchshow = () => {
  setDatevisibility(true);
}

  useEffect(() => {
    db.transaction(tx => {
      setupDatabase(tx);
      updateRowInDatabase_if(tx);
      selectDataFromDatabase(tx);
  });
    
  }, []);

 
  const setupDatabase = () => {
    db.transaction(tx => {
      //tx.executeSql(
      //  'drop table if exists groceries_amount;'
      //  );
      tx.executeSql(
        "create table if not exists groceries_amount (id integer primary key not null, totalAmount int, spentAmount int);"
      );
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS Barone (id INTEGER PRIMARY KEY NOT NULL, rentDate date, TotalNumberOfDays INT);",
        [],
        () => {
          
          updateRowInDatabase_if(tx);
          selectDataFromDatabase(tx);
        },
        (_, error) => {
          console.error("Error creating table:", error);
        }
      );
    });
  };

  const selectDataFromDatabase = (tx) => {
    
    tx.executeSql(
      `SELECT * FROM Barone;`,
      [],
      (_, { rows: { _array } }) => {

        _array.forEach((row) => {
          const daysRemainingValue = moment(row.rentDate, 'DD-MM').diff(moment(), 'days');
         
          setDays_remaining(daysRemainingValue);
          setRentDate(row.rentDate);
          const totalNumberOfDayValue = row.TotalNumberOfDays;
          
          setTotalNumberOfDay(totalNumberOfDayValue);
          const daysHappenedValue = parseInt(totalNumberOfDayValue) - daysRemainingValue;
          
          setDaysHappened(daysHappenedValue);
        });
      },
      (_, error) => {
        console.error("Error selecting data:", error);
      }
    );
  };

  const [maxValue, setMaxValue] = useState(0);
  const [value, setValue] = useState(0);
  
  
  const updateRowInDatabase = (tx,date_) => {
    
    const startDate = moment(date_, 'DD-MM').subtract(1, 'months');
    const endDate = moment(date_, 'DD-MM');
    

    tx.executeSql(
      "UPDATE Barone SET rentDate = ?, TotalNumberOfDays = ? WHERE id = 1",
      [date_, endDate.diff(startDate, 'days')],
      (_, updateResult) => {
        console.log("Row updated successfully");
        // Handle success as needed
        selectDataFromDatabase(tx);
        
        
      },
      (_, error) => {
        console.error("Error updating row:", error);
        // Handle error as needed
      }
    );
  };

  const updateRowInDatabase_if = (tx) => {
    if (moment().format('DD') === '09') {
      setFutureDate(moment().clone().add(1, 'months'));
      const startDate = moment(futureDate, 'DD-MM')
      const endDate = moment(today, 'DD-MM');
        
      setTotalNumberOfDay(startDate.diff(endDate, 'days'));
     
      setRentDate(startDate.format('DD-MM'))
      
      tx.executeSql(
      "UPDATE Barone SET rentDate = ?, TotalNumberOfDays = ? WHERE id = 1",
      [futureDate.format('DD-MM'), startDate.diff(endDate, 'days')],
      (_, updateResult) => {
        console.log("Row updated successfully");
        // Handle success as neededr
        selectDataFromDatabase(tx);
      },
      (_, error) => {
        console.error("Error updating row:", error);
        // Handle error as needed
      }
      
    );
    }
   
  };
  
 const [dataAPP,setDataAPP] = useState([]);
  const fetchData = useCallback(() => {
    db.transaction(tx => {
      tx.executeSql(
        `select who from groceries_details ;`,
        [],
        (_, { rows: { _array } }) => { 
          
          let dataApp = []; // Initialize an empty array to store the concatenated values
    
          _array.forEach(row => {
           
            dataApp = dataApp.concat(row.who.split(','));
            
          });
          const counts = dataApp.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc; // Return the accumulator after processing each element
          }, {});
          setDataAPP(counts)
        },
        (_, selectError) => {
          // Handle select error
          console.error("Error selecting data from groceries_amount:", selectError);
        }
      ); 
      tx.executeSql(
        `select * from groceries_amount ;`,
        [],
        (_, { rows: { _array } }) => { 
          // Loop through each row in the result array
          _array.forEach(row => {
            setTotalAmount(row.totalAmount);
            setSpentAmount(row.spentAmount); 
            
          });
        },
        (_, selectError) => {
          // Handle select error
          console.error("Error selecting data from groceries_amount:", selectError);
        }
      ); 
    })
   
  });

  useEffect(() => {
    // Actions dependent on state updates
    
    console.log('future rent date set');
  }, [futureDate]); // Trigger useEffect when daysHappened changes
  

   
 
  console.log(dataAPP.pavan)

  const dataforbarchart = {
    labels: ["pavan", "Muni", "Krishna", "Dinesh", "Hareesh"],
    datasets: [
      {
        data: [dataAPP.pavan? dataAPP.pavan:0 , dataAPP.muni?dataAPP.muni:0, dataAPP.krishna?dataAPP.krishna:0, dataAPP.dinesh?dataAPP.dinesh:0, dataAPP.hareesh?dataAPP.hareesh:0]
      }
    ]
  };
  
  
  
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );
  
  const chartConfig = {
    backgroundGradientFrom: "blue",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "black",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `black`,
    strokeWidth: 1, // optional, default 3
    barPercentage: 1,
    useShadowColorFromDataset: false // optional
  }; 
  console.log(totalAmount-spentAmount);
  return (
    <ScrollView>
    <View>

<DateTimePickerModal
                      isVisible={datevisiblity}
                      onConfirm={dateconfirm}
                      onCancel={datecancel}
                      mode={'date'}
                      datePickerModeAndroid={'spinner'}
                  />
                  
                  <View style = {{flexDirection:'row',marginTop:7}}>

                  <Text style={{  alignItems: 'center',fontSize: 18, color: 'black',marginLeft:10,fontWeight: 'bold'}} >Rent Date :</Text>

                  <TouchableOpacity style={{ justifyContent: 'flex-start', alignItems:'flex-start',alignSelf:'flex-start'}} onPress={touchshow}>

                      <Text style={{  alignItems: 'center',fontSize: 18, color: 'blue',marginLeft:10,fontWeight: 'bold'}} > {rentDate ?rentDate: 'Select Date'}</Text>
                     
                      </TouchableOpacity>
                      <View style = {{marginLeft:35,marginBottom:5}}>
                        <Text style={{  alignItems: 'center',fontSize: 18, color: 'black',marginLeft:10,fontWeight: 'bold'}}>Budget : {' '} <Text style={{fontSize:18,fontWeight:'bold' ,color:'blue'}}>£{totalAmount}</Text> {' '}</Text>
                      </View>
                      
                  </View>
      <View style={styles.container}>
      
      <AnimatedCircularProgress
          size={180}
          width={25}
          backgroundWidth={30}
          fill={daysHappened/totalNumberOfDay*100}
          tintColor={daysHappened == totalNumberOfDay? 'black' :"blue"}
          backgroundColor="gray"
          rotation={360} 
          lineCap="round"
          onAnimationComplete = {() => {today==rentDate? Alert.alert('rent date'): console.log('hello')}} 
        >
          {fill => <Text style={{fontSize:22,fontWeight: 'bold'}}>{'       '+ Math.round(days_remaining) } {' '} <Text style={{fontSize:15,fontWeight:'bold' }}>{'\n' +' days to go'}</Text> {' '}</Text>}
        </AnimatedCircularProgress>

        <AnimatedCircularProgress
          size={180}
          width={25}
          backgroundWidth={30}
          fill={spentAmount/totalAmount*100}
          tintColor={totalAmount== spentAmount ? 'black' :"#F71D04"}
          backgroundColor="gray"
          rotation={360} 
          lineCap="round" 
        >
          {fill => <Text style={{fontSize:20,fontWeight: 'bold'}}>{'       £'+ Math.round(totalAmount-spentAmount) } {''} <Text style={{fontSize:15,fontWeight:'bold' }}>{ '\n' +' Amount Left'}</Text> {' '}</Text>}
        </AnimatedCircularProgress>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        <View style={styles.pressButton}>
          <Button title='See Rent Details' color='#0C88F2' onPress= {() => navigation.navigate('Total')} />
        </View>
        <View style={styles.pressButton}>
          <Button title='Groceries Details' color='#0C88F2' onPress= {() => navigation.navigate('Groceries')} />
        </View>
      </View>

      <View style={styles.bar}>
      <View style = {{flex:1,alignItems:'center' , marginBottom: 5}}>
      <Text style = {{fontWeight:'bold'}}> N.O Of Times Went To Shop</Text>
      </View>
      <BarChart
        data={dataforbarchart}
        withInnerLines ={false}
        width={400}
        height={260}  
        showValuesOnTopOfBars ={true}
        fromZero = {true}
        chartConfig={chartConfig}    
/>
        
      </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  bar: {
    flex: 1,
   
    marginTop: 80
  },
  pressButton: {
    flexDirection: 'row',
    marginTop: 30,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: 'black',
    backgroundColor: 'white',
    shadowColor: 'grey',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5
  },
  title: {
    fontSize: 24,
    margin: 10,
  },
});
  
