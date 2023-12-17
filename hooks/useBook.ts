import {
  UseInfiniteQueryResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { request } from '../utils/axios-interceptor';

export type Book = {
  id: number;
  isbn: number;
  name: string;
  bookCover?: string;
  copies: number;
  author: { id: number; name: string };
  category: { id: number; name: string };
};

export type IssuedBook = {
  id: number;
  isbn: string;
  bookName: string;
  bookCover?: string;
  studentId: string;
  dueDate: string;
  returnedDate: Date;
  isReturn: boolean;
  lateFee: number;
  createdAt: Date;
  updatedAt: Date;
  book: Book;
};

type User = {
  id: number;
  role: 'STUDENT' | 'TEACHER' | 'GRADUATE';
  email: string;
  username?: string;
  profile?: Profile;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Profile = {
  id: number;
  fullname?: string;
  profilePhoto?: string;
  profilePhotoId?: string;
  department?: string;
  course?: string;
  college?: string;
  mobile?: string;
  userId: number;
};

type BookRequestResponse = {
  id: number;
  book: Book;
  status: RequestStatusType;
  isCancelled: boolean;
  requestDate: Date;
  updatedAt: Date;
};

type LateFee = {
  initialFee: number;
  followingDateFee: number;
};

type InfiniteQueryBookList = [{ id: number }];

type UnreturnedBook = {
  book: Book;
  isReturn: true;
  dueDate: Date;
};

export type RequestStatusType =
  | 'PENDING'
  | 'DISAPPROVED'
  | 'FORPICKUP'
  | 'RELEASED';

export type Category = {
  id: number;
  name: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type StudentWithBorrowedBook = User & {
  borrowedBooks: IssuedBook[];
};

export const useGetBook = (id: number): UseQueryResult<Book> => {
  const getBook = () => request({ url: `/book/?id=${id}` });

  return useQuery(['book', id], getBook, {
    onError: (error: ErrorResponse) => error,
  });
};

const getRequestedBook = () => request({ url: '/book/requested' });

export const useGetRequestedBook = (): UseQueryResult<BookRequestResponse> =>
  useQuery(['book', 'requested'], getRequestedBook);

const getBookLateFee = () => request({ url: '/book/late_fee' });

export const useGetBookLateFee = (): UseQueryResult<LateFee> =>
  useQuery(['book', 'latefee'], getBookLateFee, {
    onError: (error: ErrorResponse) => error,
  });

const getUnreturnedBook = () => request({ url: '/book/unreturned' });

export const useGetUnreturnedBook = (): UseQueryResult<UnreturnedBook> =>
  useQuery(['book', 'unreturned'], getUnreturnedBook);

const fetchBookList = ({
  pageParam = undefined,
  filter = '',
  category = '',
}: {
  pageParam?: unknown;
  filter?: string;
  category?: string;
}) =>
  request({
    url: `/book/list/?cursor=${pageParam}&filter=${filter}&category=${category}`,
  });

export const useBookList = (
  filter: string,
  category: string
): UseInfiniteQueryResult<InfiniteQueryBookList, Error> =>
  useInfiniteQuery({
    queryKey: ['bookList'],
    queryFn: (context) => fetchBookList({ ...context, filter, category }),
    getNextPageParam: (lastPage) => {
      const lastPost = lastPage[lastPage.length - 1];
      // return the book id as cursor for next page request
      return lastPost?.id;
    },
  });

const requestBook = (data: { bookId: number }) =>
  request({ url: '/book/request', method: 'post', data });

export const useRequestBook = () =>
  useMutation(requestBook, {
    onError: (error: ErrorResponse) => error,
  });

const cancelRequest = (data: { requestId: number }) =>
  request({ url: '/book/cancel_request', method: 'put', data });

export const useCancelRequest = () => {
  return useMutation(cancelRequest, {
    onError: (error: ErrorResponse) => error,
  });
};

const changeRequestStatus = (data: {
  id: number;
  bookId: number;
  userId: number;
  status: RequestStatusType;
  dueDate?: Date;
}) => request({ url: '/book/change_request_status', method: 'put', data });

export const useChangeRequestStatus = () => {
  return useMutation(changeRequestStatus, {
    onError: (error: ErrorResponse) => error,
  });
};

const getActiveCategories = () => request({ url: '/category/active' });

export const useGetActiveCategories = (): UseQueryResult<Category[]> =>
  useQuery(['category', 'active'], getActiveCategories, {
    onError: (error: ErrorResponse) => error,
  });

export const useGetStudentBorrowedBooks = (
  id?: string
): UseQueryResult<StudentWithBorrowedBook> => {
  const getStudentBorrowedBooks = () =>
    request({ url: `/user/borrowed_books/${id}` });

  return useQuery(['student', 'borrowed', 'books'], getStudentBorrowedBooks, {
    onError: (error: ErrorResponse) => error,
  });
};

type ErrorResponse = {
  message?: string;
};
