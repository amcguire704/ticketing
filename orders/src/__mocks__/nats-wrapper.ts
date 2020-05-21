export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
// this is teh mock function in the testing environment meaning that the test will
// just make sure that the callback function was called after it has published an
//event .. thus the reason the callback is returning nothing and no functionality it
//... it jsut needs to be called
