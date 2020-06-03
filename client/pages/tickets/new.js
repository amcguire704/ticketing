import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push('/'),
  });
  const onSubmit = (e) => {
    e.preventDefault();
    doRequest();
  };
  const onBlur = () => {
    const value = parseFloat(price); //parseFLoat is a funciton that will return a
    //number or a NaN not a number
    //onBlur event is triggered on input any time a user clicks in then clicks out
    //of an input
    if (isNaN(value)) {
      //isNaN() is built into JS and is a function that will
      //take a number and check if it is a number or not
      return;
    }
    setPrice(value.toFixed(2)); //this will round to the nearest .00
    // so like 10.0009 will get round up to 10.00
  };
  return (
    <div>
      <h1>Create a Ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title </label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Price </label>
          <input
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={onBlur}
          />
        </div>
        {errors}
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};
//errors will only show when it has some data in the useRequest file
//the errors block is a state value that is called only when the
//setErrors is called
export default NewTicket;
