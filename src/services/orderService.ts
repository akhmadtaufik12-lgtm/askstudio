import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Order } from '../types';

const ORDERS_COLLECTION = 'orders';

export function subscribeToUserOrders(
  userId: string,
  onOrdersReceived: (orders: Order[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('ownerId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Order;
        orders.push({
          ...data,
          id: docSnap.id,
        });
      });
      // Sort by updatedAt or createdAt desc
      orders.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      onOrdersReceived(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
      if (onError) onError(error);
    }
  );
}

export async function saveOrderToFirestore(order: Order, userId: string): Promise<void> {
  const orderDocRef = doc(db, ORDERS_COLLECTION, order.id);
  const orderData = {
    ...order,
    ownerId: userId,
    updatedAt: Date.now(),
  };

  try {
    await setDoc(orderDocRef, orderData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLLECTION}/${order.id}`);
  }
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const orderDocRef = doc(db, ORDERS_COLLECTION, orderId);
  try {
    await deleteDoc(orderDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

export async function batchSyncLocalOrdersToFirestore(
  localOrders: Order[],
  userId: string
): Promise<number> {
  let count = 0;
  for (const order of localOrders) {
    await saveOrderToFirestore(order, userId);
    count++;
  }
  return count;
}
