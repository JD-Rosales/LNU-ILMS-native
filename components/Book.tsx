import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { InterText } from './StyledText';
import {
  useGetBook,
  useRequestBook,
  useCancelRequest,
  useGetRequestedBook,
  useGetUnreturnedBook,
} from '../hooks/useBook';
import Colors from '../constants/Colors';
import { useEffect, useState } from 'react';

const Book = ({
  requestId,
  bookId,
  type,
}: {
  requestId?: number;
  bookId: number;
  type: 'request' | 'unreturn' | 'cancel';
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const book = useGetBook(bookId);
  const requestBook = useRequestBook();
  const cancelRequest = useCancelRequest();
  const requestedBook = useGetRequestedBook();
  const unreturnedBook = useGetUnreturnedBook();

  const handleBookPress = () => {
    if (type === 'unreturn') return;

    setModalVisible(true);
  };

  const handleCancelRequest = () => {
    cancelRequest.mutate({
      requestId: requestId ?? 0,
    });
  };

  const handleRequestBook = () => {
    requestBook.mutate({ bookId });
  };

  const handleReturnBook = () => {
    return;
  };

  useEffect(() => {
    if (type === 'request') {
      if (requestBook.isSuccess && type) {
        requestedBook.refetch();
        unreturnedBook.refetch();

        setModalVisible(false);
        requestBook.reset();

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Borrowed book request sent!',
          position: 'top',
          topOffset: 50,
        });
      } else if (requestBook.isError) {
        setModalVisible(false);
        requestBook.reset();

        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: `${requestBook.error.message}`,
          position: 'top',
          topOffset: 50,
        });
      }
    }
  }, [requestBook.isSuccess, requestBook.isError]);

  useEffect(() => {
    if (type === 'cancel') {
      if (cancelRequest.isSuccess) {
        requestedBook.refetch();
        setModalVisible(false);
        cancelRequest.reset();

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Book request cancelled successfully!',
          position: 'top',
          topOffset: 50,
        });
      } else if (cancelRequest.isError) {
        setModalVisible(false);
        cancelRequest.reset();

        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: `${cancelRequest.error.message}`,
          position: 'top',
          topOffset: 50,
        });
      }
    }
  }, [cancelRequest.isSuccess, cancelRequest.isError]);

  if (book.isLoading) return <BookLoader />;

  return (
    <>
      <TouchableOpacity activeOpacity={0.8} onPress={handleBookPress}>
        <View style={styles.container}>
          <View style={styles.card}>
            {book.data?.bookCover ? (
              <Image
                source={{
                  uri: book.data?.bookCover,
                }}
                style={styles.image}
              />
            ) : (
              ''
            )}
          </View>

          <View style={styles.details}>
            <InterText style={styles.bookTitle}>{book.data?.name}</InterText>
            <InterText
              style={styles.bookAuthor}
            >{`(${book.data?.author.name})`}</InterText>

            <InterText
              style={{
                ...styles.text,
                fontStyle: 'italic',
                marginTop: 10,
              }}
            >
              ISBN: {book.data?.isbn}
            </InterText>

            <InterText
              style={{
                ...styles.text,
                fontStyle: 'italic',
              }}
            >
              Copies Available: {book.data?.copies}
            </InterText>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.centeredView}>
        <Modal
          animationType='fade'
          transparent={true}
          visible={modalVisible}
          // onRequestClose={() => {
          //   Alert.alert('Modal has been closed.');
          //   setModalVisible(!modalVisible);
          // }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 20,
                }}
              >
                <View style={styles.modalCard}>
                  {book.data?.bookCover ? (
                    <Image
                      source={{
                        uri: book.data?.bookCover,
                      }}
                      style={styles.image}
                    />
                  ) : (
                    ''
                  )}
                </View>

                <View
                  style={{
                    flex: 1,
                    paddingStart: 10,
                  }}
                >
                  <InterText style={styles.bookTitle}>
                    {book.data?.name}
                  </InterText>
                  <InterText
                    style={styles.bookAuthor}
                  >{`(${book.data?.author.name})`}</InterText>

                  <InterText
                    style={{
                      ...styles.text,
                      fontStyle: 'italic',
                      marginTop: 10,
                    }}
                  >
                    ISBN: {book.data?.isbn}
                  </InterText>

                  <InterText
                    style={{
                      ...styles.text,
                      fontStyle: 'italic',
                    }}
                  >
                    Copies Available: {book.data?.copies}
                  </InterText>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  marginLeft: 'auto',
                  marginTop: 'auto',
                  gap: 10,
                }}
              >
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <InterText style={{ ...styles.textStyle, color: '#000' }}>
                    Cancel
                  </InterText>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.buttonAccept]}
                  onPress={
                    type === 'request'
                      ? handleRequestBook
                      : type === 'cancel'
                      ? handleCancelRequest
                      : handleReturnBook
                  }
                >
                  {requestBook.isLoading || cancelRequest.isLoading ? (
                    <ActivityIndicator
                      size='small'
                      color='#fff'
                      style={{ marginRight: 10 }}
                    />
                  ) : (
                    <InterText style={styles.textStyle}>
                      {type === 'request'
                        ? 'Request Book'
                        : type === 'unreturn'
                        ? 'Return Book'
                        : 'Cancel Request'}
                    </InterText>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

export default Book;

const BookLoader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}></View>

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator
          size='large'
          color={Colors['light'].primary}
          style={{ marginRight: 10 }}
        />
        <InterText
          style={{
            ...styles.text,
            textAlign: 'center',
            fontStyle: 'italic',
            marginTop: 10,
          }}
        >
          Please wait...
        </InterText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalView: {
    margin: 10,
    minWidth: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 2,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonClose: {
    backgroundColor: '#fff',
  },
  buttonAccept: {
    backgroundColor: Colors['light'].primary,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    color: Colors['light'].primary,
    fontSize: 21,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  modalCard: {
    borderRadius: 6,
    elevation: 3,
    backgroundColor: '#f0f0f0',
    shadowOffset: { width: 1, height: 1 },
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    width: 100,
    height: 150,
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 6,
    elevation: 3,
    backgroundColor: '#FFFFF7',
    shadowOffset: { width: 1, height: 1 },
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginBottom: 10,
    padding: 6,
  },
  card: {
    borderRadius: 6,
    elevation: 3,
    backgroundColor: '#f0f0f0',
    shadowOffset: { width: 1, height: 1 },
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    width: 100,
    height: 150,
  },
  image: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  details: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  bookTitle: {
    color: Colors['light'].primary,
    fontSize: 21,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  bookAuthor: {
    color: Colors['light'].secondary,
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  text: {
    color: 'black',
  },
});
