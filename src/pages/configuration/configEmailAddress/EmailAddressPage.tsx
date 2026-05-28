import React from 'react'
import MainLayout from '../../MainLayout'
import EmailAddressTable from './EmailAddressTable'
// import EmailAddressForm from './EmailAddressForm'


const EmailAddressPage: React.FC = () => {
  //const [ shouldRefresh, setShouldRefreshed ] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const refreshUserTable = () => {
  //   setShouldRefreshed(prev => prev + 1 );
  // }

  return (
    
    <MainLayout title="Configuration > List of Email Addresses">
        <EmailAddressTable onAddUserClick={() => {}}  />
        {/* <EmailAddressForm isDrawerOpen={isDrawerOpen} closeDrawer={() =>setIsDrawerOpen(false)} onUserAction={refreshUserTable} drawerMode="add" /> */}
    </MainLayout>
  )
}

export default EmailAddressPage