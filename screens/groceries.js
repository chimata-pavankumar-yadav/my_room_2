import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { DataTable } from 'react-native-paper';
import { TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, View, Text,TextInput,Pressable, Image, Linking, Button, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Formik } from 'formik';
import * as yup from 'yup';

const TableExample = ({ navigation, route }) => {
  const db = SQLite.openDatabase("my_room_1.db");
  const [data2, setData2] = useState([]);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState('');


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(() => {
    db.transaction(tx => {
      
      tx.executeSql('create table if not exists groceriesBox (id integer primary key not null, groceriesText text)');
      tx.executeSql(
        `select * from groceries_details ;`,
        [],
        (_, { rows: { _array } }) => setData(_array),
        (tx, error) => {
          console.error(error);
        }
      );
      selectDataForGroceriesBox(tx);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const openImage = (uri) => {
    setSelectedImageUri(uri);
    setModalVisible(true);
  };
  
  const deleteGroceriesList = (item) => {
    
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this item?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => confirmDeleteGroceries(item.id,item.groceriesText)
        }
      ]
    );
  };


  const confirmDeleteGroceries = (id, groceriesText) => {
   
    db.transaction(tx => {
      tx.executeSql(
        "DELETE FROM groceriesBox WHERE id = ?;",
        [id],
        (_, deleteResult) => {
          console.log("Row deleted successfully");
          selectDataForGroceriesBox(tx);
           // Refresh data after deletion
        },
        (_, error) => {
          console.error("Error deleting row:", error);
        }
      );

      
      
    });
  };

  const deleteFun = (item) => {
    
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this item?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => confirmDelete(item.id,item.spent)
        }
      ]
    );
  };

  const confirmDelete = (id, spent) => {
   
    db.transaction(tx => {
      tx.executeSql(
        "DELETE FROM groceries_details WHERE id = ?;",
        [id],
        (_, deleteResult) => {
          console.log("Row deleted successfully");
           // Refresh data after deletion
        },
        (_, error) => {
          console.error("Error deleting row:", error);
        }
      );

      tx.executeSql(
        'update groceries_amount set spentAmount = spentAmount - ? where id = 1',
        [spent],
        (_, updateResult) => { 
          // Handle successful update
          fetchData();
        },
        (_, updateError) => {
          // Handle error updating groceries_amount
          console.error('Error updating groceries_amount:', updateError);
        }
      );
      
    });
  };
  
  const validationSchema = yup.object().shape({
    groceriesText: yup.string().required('Please Enter Valid Data')
  });
  
  const submitData = (data) => {
   
    db.transaction(tx => {
      tx.executeSql(
        "insert into groceriesBox (groceriesText) Values (?);",
        [data.groceriesText],
        (_, selectResult) => {
          // Handle error updating groceries_amount
          console.log('success');
          selectDataForGroceriesBox(tx);
        },
        (_, updateError) => {
          // Handle error updating groceries_amount
          console.error('Error inserting groceriesBox:', updateError);
        }
      );
    });
  };

  const selectDataForGroceriesBox = (tx) => {
    db.transaction(tx => {
      tx.executeSql(
        `select * from groceriesBox ;`,
        [],
        (_, { rows: { _array } }) => { 
          // Loop through each row in the result array
         
            
             setData2(_array); 
            
         
        },
      ); 
     
    });
  }

  
  return (
    <View style={styles.container}>
      {data.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No data Added</Text>
        </View>
      ) : (
        <>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title>Date</DataTable.Title>
            <DataTable.Title maxWidth={190} style={styles.whoColumn}>Who</DataTable.Title>
            <DataTable.Title maxWidth={50}>Spent</DataTable.Title>
            <DataTable.Title maxWidth={50}>Pic</DataTable.Title>
          </DataTable.Header>
          <FlatList 
            data={data}
            renderItem={({ item }) => (
              <DataTable>
               <TouchableOpacity onLongPress={() => deleteFun(item)}>
                <DataTable.Row>
                  <DataTable.Cell maxWidth={60} >{item.date}</DataTable.Cell>
                  
                  <DataTable.Cell maxWidth={200} >{item.who}</DataTable.Cell>
                             
                 <DataTable.Cell style={styles.spentColumn}>{item.spent}</DataTable.Cell>
                  <TouchableOpacity onPress={() => openImage(item.pic)}>
                    <Image source={{ uri: item.pic }} style={styles.image} />
                  </TouchableOpacity>
                </DataTable.Row>
                </TouchableOpacity>  
              </DataTable>
            )}
            keyExtractor={(item, index) => index.toString()}
          />

          <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Image source={{ uri: selectedImageUri }} style={styles.modalImage} />
                <Button title="Close" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </Modal>
        </>
      )}
      <View style={styles.footer}>
      <View style={{fontWeight:'bold', margin:7}}>
      <Text style={{textAlign:'center',fontWeight:'bold',fontSize:15}}>Groceries Need</Text>
      </View>
      
      <Formik
        initialValues={{ groceriesText: ''}}
        onSubmit={(values, actions) => {
                
                 
                submitData(values);
                actions.resetForm();
                
                }}
        validationSchema={validationSchema}
      >
            {(props) => (
                        <View>
              <View style = {styles.formPage}>
              
               <TextInput style = {styles.text} 
               inputMode = 'text' 
              keyboardType='ascii-capable' 
              onChangeText={props.handleChange('groceriesText')}
              value={props.values.groceriesText}
              placeholder='Enter Grocery Essentials' />
         
          
          <View style={{flex:1,alignItems:'center',backgroundColor:'#418586',height:30,marginTop:10,marginHorizontal:7,borderRadius:3}}>
                    <Pressable onPress = {props.handleSubmit}>
                        <Text style={{fontSize:20}}>Go</Text>
                    </Pressable>

                </View>
               
          </View> 
          <Text style={{ fontSize: 10, textAlign:'center',color:'red'}}>{props.touched.groceriesText && props.errors.groceriesText}</Text>
          </View>
            )} 
             </Formik>
             
             <View style= {{backgroundColor:'#6D9999',height:50,marginHorizontal:10,flex:1,borderRadius:27,}}>
             
             <FlatList 
            data={data2.reverse()}
            renderItem={({ item }) => (
              <View style ={{borderTopWidth: 0,borderBottomWidth:1,borderColor:'black',padding:4.5}}>
               <TouchableOpacity onLongPress={() => deleteGroceriesList(item)}>
                  <Text style={{color:'white', fontSize: 15,}} >{item.groceriesText}</Text>
                  </TouchableOpacity>
                  </View>
                  )}
            keyExtractor={(item, index) => index.toString()}
            reverse={true}
          />
          
             </View>
             
      </View>
    
    </View>
   
  );
};

export default TableExample;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    color: 'gray',
  },
  tableHeader: {
    backgroundColor: '#DCDCDC',
  },
  whoColumn: {
    justifyContent: 'flex-start',
  },
  spentColumn: {
    justifyContent: 'flex-end',
    marginRight: 12,
  },
  image: {
    width: 50,
    height: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 10,
    borderRadius: 10,
  },
  modalImage: {
    width: 390,
    height: 370,
  },
  footer: {
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#6D9999',
    height:250,
    borderRadius:10
    
  },
  formPage:{
    flexDirection:'row',
    justifyContent: 'flex-start',
    alignItems:'center',
    marginLeft:7,
    marginBottom:5,
   
   
    
},text:{
  fontSize:17,
    textAlign:'center',
    backgroundColor:'#fff',
    borderColor:'white',
    width:300,
    height:30,
    marginTop:10,
    borderWidth:1,
    borderColor:'black',
    borderRadius:3
   
},
});
