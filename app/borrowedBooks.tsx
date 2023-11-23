import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  useColorScheme,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useVerifyToken } from '../hooks/useAuth';
import {
  StudentWithBorrowedBook,
  useGetBookLateFee,
  useGetStudentBorrowedBooks,
} from '../hooks/useBook';
import Book from '../components/Book';
import { InterText } from '../components/StyledText';
import Colors from '../constants/Colors';
import { differenceInDays, format, isAfter, parseISO } from 'date-fns';

export default function ModalScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const auth = useVerifyToken();
  const getBookLateFee = useGetBookLateFee();
  const studentBorrowedBooks = useGetStudentBorrowedBooks(
    auth.data?.id.toString() ?? ''
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    auth.refetch();
    getBookLateFee.refetch();
    studentBorrowedBooks.refetch();

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const formatDate = (date?: Date) => {
    if (!date) return;

    return format(parseISO(date.toString()), 'MMM d, yyyy h:mm a');
  };

  const calculateLateFee = (
    isReturn: boolean,
    dueDate: string,
    fee: number
  ): number => {
    if (isReturn) return fee;
    if (getBookLateFee.isLoading || !getBookLateFee.data) return 0;

    const currentDateAndTime = new Date();
    const dateDue = parseISO(dueDate);

    const daysLate = differenceInDays(currentDateAndTime, dateDue);

    let lateFee = 0;
    if (isAfter(currentDateAndTime, dateDue))
      lateFee = lateFee + getBookLateFee.data.initialFee;

    // add the followingDateFee if late for more than 1 day
    if (daysLate >= 1) {
      for (let i = daysLate; i >= 1; i--) {
        lateFee = lateFee + getBookLateFee.data.followingDateFee;
      }
    }

    return lateFee;
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={styles.scroll}
    >
      <View style={styles.container}>
        {studentBorrowedBooks.data?.borrowedBooks.map((book) => {
          return (
            <View
              style={{
                paddingBottom: 5,
                marginBottom: 20,
                // borderBottomColor: 'gray',
                // borderBottomWidth: 0.5,
              }}
            >
              <Book bookId={book.book.id} type='unreturn' />

              <View style={styles.textContainer}>
                <InterText style={[styles.text, styles.heading]}>
                  Issued Date:
                </InterText>

                <InterText style={[styles.text, styles.description]}>
                  {formatDate(book.createdAt)}
                </InterText>
              </View>

              <View style={styles.textContainer}>
                <InterText style={[styles.text, styles.heading]}>
                  Return Date:
                </InterText>

                {book.isReturn ? (
                  <InterText style={[styles.text, styles.description]}>
                    {formatDate(book.returnedDate)}
                  </InterText>
                ) : (
                  <InterText
                    style={[styles.text, styles.description, { color: 'red' }]}
                  >
                    Unreturn
                  </InterText>
                )}
              </View>

              <View style={styles.textContainer}>
                <InterText style={[styles.text, styles.heading]}>
                  Fine (if any):
                </InterText>

                <InterText style={[styles.text, styles.description]}>
                  {`₱ ${calculateLateFee(
                    book.isReturn,
                    book.dueDate,
                    book.lateFee
                  ).toFixed(2)}`}
                </InterText>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  textContainer: {
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#000',
  },
  heading: {
    fontSize: 15,
    minWidth: 140,
  },
  description: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors['light'].primary,
  },
});
