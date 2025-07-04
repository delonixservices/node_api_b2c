// Toast functionality removed - using console logging instead
const checkIsArray = (data: unknown) => {
  if (data instanceof Array) return true;
  else return false;
};

const successMsg = (data: string | { message: string }[]) => {
  if (checkIsArray(data)) {
    (data as { message: string }[]).forEach((m: { message: string }) => {
      console.log('Success:', m.message);
    });
  } else {
    console.log('Success:', data as string);
  }
};

const errorMsg = (data: string | { message: string }[]) => {
  if (checkIsArray(data) && data.length > 0) {
    (data as { message: string }[]).forEach((m: { message: string }) => {
      console.error('Error:', m.message);
    });
  } else {
    console.error('Error:', data as string);
  }
};

const defaultMsg = (data: string | { message: string }[]) => {
  if (checkIsArray(data)) {
    (data as { message: string }[]).forEach((m: { message: string }) => {
      console.log('Info:', m.message);
    });
  } else {
    console.log('Info:', data as string);
  }
};

export const showToast = (type = "default", message: string) => {
  switch (type) {
    case "success":
      successMsg(message);
      break;
    case "error":
      errorMsg(message);
      break;
    default:
      defaultMsg(message);
      break;
  }
};

export default function Notify() {
  return null; // No longer renders ToastContainer
}
