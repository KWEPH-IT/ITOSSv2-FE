import MainLayout from "../../MainLayout";
import DBColumnsTable from "./DBColumnsTable";



const DBColumnsPage = () => {
  return (
    <MainLayout title="Configuration > Active Systems">
        <DBColumnsTable></DBColumnsTable>
    </MainLayout>
  )
}

export default DBColumnsPage