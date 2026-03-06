import { useState } from 'react'
import MainLayout from '../../MainLayout'
import TicketCategoriesTable from './TicketCategoriesTable'
import TicketCategoriesForm from './TicketCategoriesForm'
import { TicketCategProps } from '../../../types/TicketsCateg_drawer'

const TicketCategoriesPage = () => {
  const [ isDrawerOpen, setIsDrawerOpen ] = useState(false);
  const [ drawerMode, setDrawerMode ] = useState<'add' | 'edit'>('add');
  const [ shouldRefresh, setShouldRefreshed ] = useState(0);
  const [ selectedRecord, setSelectedRecord ] = useState<TicketCategProps | null>(null);

  const refreshUserTable = () => {
    setShouldRefreshed(prev => prev + 1 );
  }

  const showAddDrawer = () => {
    setIsDrawerOpen(true)
    setDrawerMode('add')
    setSelectedRecord(null);
  }

  const showEditDrawer = (record : TicketCategProps) => {
    setIsDrawerOpen(true)
    setDrawerMode('edit')
    setSelectedRecord(record)
  }


  return (
    <MainLayout title="Configuration > Ticket Categories">
        <TicketCategoriesTable onAddUserClick={showAddDrawer} onEditClick={showEditDrawer} shouldRefresh={shouldRefresh}/>
        <TicketCategoriesForm isDrawerOpen={isDrawerOpen} drawerMode={drawerMode} closeDrawer={() => setIsDrawerOpen(false)} onUserAction={refreshUserTable} record={selectedRecord}/>
        
    </MainLayout>
  )
}

export default TicketCategoriesPage