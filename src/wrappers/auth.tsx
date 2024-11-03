import { Navigate, Outlet, useModel } from 'umi'

export default (props) => {
  const { isLogin,initializing } = useModel('user');
  console.log(isLogin,'isLogin')
  if (initializing) {
    return <div>loading...</div>
  }
  if (isLogin) {
    return <Outlet />;
  } else{
    return <Navigate to="/login" />;
  }
}