import { useState } from 'react'
import MainLayout from '../../MainLayout'
import EquipmentInvTable from './EquipmentInvTable'
import { Segmented } from 'antd'
import EquipmentInvForm from './EquipmentInvForm'
import UnitAssignment from './UnitAssignment'

export const EquipmentInvPage = () => {
    const [activeView, setActiveView] = useState<'equipmentView' | 'UnitAssignment' | 'stats'>('equipmentView');
    const [ openModal, setOpenModal ] = useState(false);
    const [ shouldRefresh, setShouldRefreshed ] = useState(0);

    const refreshUserTable = () => {
        setShouldRefreshed(prev => prev + 1 );
      }

  return (
    <MainLayout title="Inventory > Equipment">
        <Segmented
        options={[
          { label: 'Equipment Inventory', value: 'equipmentView' },
          { label: 'Unit Assignment', value: 'UnitAssignment' },
          { label: 'Stats', value: 'stats' },
        ]}
        value={activeView}
        onChange={(value) => setActiveView(value as any)}
      />
       { activeView === 'equipmentView' ? ( 
        <>
            <EquipmentInvTable onAddNew={() => setOpenModal(true)} shouldRefresh={shouldRefresh}></EquipmentInvTable>
            <EquipmentInvForm isModalOpen={openModal} closeModal={() => setOpenModal(false)} onUserAction={refreshUserTable} />
        </>
       ) : 
        <UnitAssignment />
       } 
    </MainLayout>
  )
}
