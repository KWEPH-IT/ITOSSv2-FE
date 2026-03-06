import React, { useState } from 'react'
import MainLayout from '../../MainLayout'
import EmailAddressTable from './EmailAddressTable'
// import EmailAddressForm from './EmailAddressForm'


const EmailAddressPage: React.FC = () => {
  const [ isDrawerOpen, setIsDrawerOpen ] = useState(false);
  const showDrawer = () => setIsDrawerOpen(true);
  const [ shouldRefresh, setShouldRefreshed ] = useState(0);


  const refreshUserTable = () => {
    setShouldRefreshed(prev => prev + 1 );
  }

  return (
    
    <MainLayout title="Configuration > List of Email Addresses">
        <EmailAddressTable onAddUserClick={() => setIsDrawerOpen(true)} shouldRefresh={shouldRefresh} />
        {/* <EmailAddressForm isDrawerOpen={isDrawerOpen} closeDrawer={() =>setIsDrawerOpen(false)} onUserAction={refreshUserTable} drawerMode="add" /> */}
    </MainLayout>
  )
}

export default EmailAddressPage