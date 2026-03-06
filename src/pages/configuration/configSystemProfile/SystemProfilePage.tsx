import React, { useState } from 'react'
import MainLayout from '../../MainLayout'
import SystemProfileTable from './SystemProfileTable'
import SystemProfileForm from './SystemProfileForm'
import { SystemProfileProps } from '../../../types/SystemProfile_drawer'


const SystemProfilePage: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen ] = useState(false);
  const [ drawerMode, setDrawerMode ] = useState<"add" | "edit">("add");
  const [ shouldRefresh, setShouldRefreshed ] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<SystemProfileProps | null>(null);

  const refreshUserTable = () => {
    setShouldRefreshed(prev => prev + 1 );
  }

  const showAddDrawer = () => {
    setDrawerMode("add");
    setSelectedRecord(null);
    setIsDrawerOpen(true);
  };

  const showEditDrawer = (record: SystemProfileProps) => {
    setDrawerMode("edit");
    setSelectedRecord(record)
    setIsDrawerOpen(true);
  };

  return (
    <MainLayout title="Configuration > System Profile">
        <SystemProfileTable  onAddUserClick={showAddDrawer} onEditClick={showEditDrawer} shouldRefresh={shouldRefresh} ></SystemProfileTable>
        <SystemProfileForm isDrawerOpen={isDrawerOpen} drawerMode={drawerMode} closeDrawer={() => setIsDrawerOpen(false)} onUserAction={refreshUserTable} record={selectedRecord}></SystemProfileForm>
    </MainLayout>
  )
}

export default SystemProfilePage