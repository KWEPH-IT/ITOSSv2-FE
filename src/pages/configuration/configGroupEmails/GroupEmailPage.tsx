import { useState } from 'react'
import MainLayout from '../../MainLayout'
import GroupEmailTable from './GroupEmailTable'
import { GroupEmailProps } from '../../../types/GroupEmails_drawer'
import GroupEmailForm from './GroupEmailForm'

const GroupEmailPage = () => {
  const [ isDrawerOpen, setIsDrawerOpen ] = useState(false);
  const [ drawerMode, setDrawerMode ] = useState<'add' | 'edit'>('add');
  const [ selectedRecord, setSelectedRecord ] = useState<GroupEmailProps | null>(null);
  const [ shouldRefresh, setShouldRefreshed ] = useState(0);


  const refreshUserTable = () => {
    setShouldRefreshed(prev => prev + 1 );
  }

  const showAddDrawer = () => {
    setIsDrawerOpen(true);
    setSelectedRecord(null);
    setDrawerMode("add");
  }

  const showEditDrawer = (record: GroupEmailProps) => {
    setDrawerMode("edit");
    setSelectedRecord(record)
    setIsDrawerOpen(true);
  };

  return (
    <MainLayout title="Configuration > Group Emails" >
      <GroupEmailTable onAddUserClick={showAddDrawer} onEditClick={showEditDrawer}  shouldRefresh={shouldRefresh} ></GroupEmailTable>
      <GroupEmailForm isDrawerOpen={isDrawerOpen} drawerMode={drawerMode} closeDrawer={() => setIsDrawerOpen(false)} onUserAction={refreshUserTable} record={selectedRecord}></GroupEmailForm>

    </MainLayout>
  )
}
export default GroupEmailPage