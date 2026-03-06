import React,  { useState, useMemo } from 'react'
import { Modal, Form, DatePicker, Row, Col, message, Card, Button, Checkbox } from 'antd'
import { ModalProps } from '../../../types/Drawer'
import { StyledSelect, StyledInput } from '../../../components/StyledComponents'
import { getEmployees } from '../../../hooks/configuration/vwAtKWE_hooks';
import { vwAtKWEProps } from '../../../types/vwAtKWE_drawer';
import { getAllEquipment } from '../../../hooks/inventory/equipmentInv_hooks';
import API from '../../../api/api';
import { formatDate } from '../../../utils/dateFormatter';

// 2️⃣ Type helper for string keys
type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]


// TS-safe function
function getDistinctOptions<T>(
  data: T[],
  key: StringKeys<T>
): { label: string; value: string }[] {
  const uniqueValues = Array.from(
    new Set(
      data
        .map(item => item[key])           // T[StringKeys<T>]
        .filter(Boolean) as string[]      // ✅ cast to string[]
    )
  )
  // Sort alphabetically
  uniqueValues.sort((a, b) => a.localeCompare(b))
  return uniqueValues.map(value => ({ label: value, value }))
}

const EquipmentInvForm: React.FC<ModalProps> = ({isModalOpen, closeModal, onUserAction}) => {
  const { employees } = getEmployees(); 
  const { equipment: fetchAllEquipment } = getAllEquipment()
  const [ isSubmit, setIsSubmit ] = useState(false); 
  const [ form ] =  Form.useForm()


  const eqTypeOptions = useMemo(() => {
    if (!fetchAllEquipment) return [];
    return getDistinctOptions(fetchAllEquipment, 'EqType');
  }, [fetchAllEquipment]);


  const brandOptions = useMemo(() => {
    if (!fetchAllEquipment) return [];
    return getDistinctOptions(fetchAllEquipment, 'Brand');
  }, [fetchAllEquipment]);

  const modelOptions = useMemo(() => {
    if (!fetchAllEquipment) return [];
    return getDistinctOptions(fetchAllEquipment, 'Model');
  }, [fetchAllEquipment]);


  const handleSave = async(values: any) =>{
    setIsSubmit(true);
    try{
      const payload = {
        ...values,
        Temporary: values.Temporary ? 1 : 0,
        Year_Acquired: values.Year_Acquired
          ? formatDate(values.Year_Acquired)
          : null,
        Year_Issued: values.Year_Issued
          ? formatDate(values.Year_Issued)
          : null,
        EndofWarranty: values.EndofWarranty
          ? formatDate(values.EndofWarranty) 
          : null,
        ForReplacementYear: values.ForReplacementYear
          ? formatDate(values.ForReplacementYear) 
          : null,
      };
      const response = await API.post(`/api/AddEquip`, payload);

      if (response.status === 200){
        message.success(response.data.message);
        //form.resetFields()
        closeModal();
        onUserAction()
      }
      else{
        message.error(response.data.mesage);
      }
    }
    catch(err){
      console.error("Error saving:", err);
      message.error("Error saving... Please try again.");
    }
    finally{
      //form.resetFields()
      setIsSubmit(false)
    }
  }

  return (
    <Modal
         title="Add New Record"
         open={isModalOpen}
         onCancel={closeModal}
         footer={null}
         width={800}>
            <Form layout="vertical" form={form} onFinish={handleSave}>
              <Card variant='borderless'>
                <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 15, color: "#1677ff" }}> Assignment Details </p>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Employee Name" name="EmployeeId" rules={[{ required: true }]}>
                      <StyledSelect
                          showSearch
                          optionFilterProp="label"
                          placeholder="Please select Employee Name"
                          >
                          {employees?.map((emp: vwAtKWEProps) => (
                              <StyledSelect.Option
                              key={emp.EmployeeId}
                              value={emp.EmployeeId}
                              label={emp.FullName}
                              style={{ fontSize: "13px", fontWeight: "600" }}
                              >
                              {emp.EmployeeId} - {emp.FullName}
                              </StyledSelect.Option>
                          ))}
                        </StyledSelect>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Accounted To" name="AccountedTo" rules={[{ required: true }]}>
                      <StyledSelect
                          //  onChange={handleSelect}
                          showSearch
                          optionFilterProp="label"
                          placeholder="Please select Employee Name"
                          >
                          {employees?.map((emp: vwAtKWEProps) => (
                              <StyledSelect.Option
                              key={emp.EmployeeId}
                              value={emp.EmployeeId}
                              label={emp.FullName}
                              style={{ fontSize: "13px", fontWeight: "600" }}
                              >
                              {emp.EmployeeId} - {emp.FullName}
                              </StyledSelect.Option>
                          ))}
                        </StyledSelect>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="Temporary" valuePropName="checked" >
                      <Checkbox>Temporary Accountability</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
              <Card variant='borderless'>
                <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 15, color: "#1677ff" }}> Equipment Details </p>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Type" name="EqType" rules={[{ required: true }]}>
                      <StyledSelect
                              allowClear
                              options={eqTypeOptions}
                              placeholder="Select equipment type"
                          />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Brand" name="Brand" rules={[{ required: true }]}>
                      <StyledSelect
                              allowClear
                              options={brandOptions}
                              placeholder="Select equipment type"
                          />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Model" name="Model" rules={[{ required: true }]}>
                      <StyledSelect
                              allowClear
                              options={modelOptions}
                              placeholder="Select equipment type"
                          />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Serial Number" name="SerialNumber" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Asset Code" name="AssetTag" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Acquired Cost" name="AcquiredCost" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Storage" name="Storage" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Memory" name="Memory" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Processor" name="Processor" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="OS" name="OS" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card variant='borderless' >
                <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 15,color: "#1677ff" }}> Lifecycle Details </p>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Date Acquired" name="Year_Acquired" >
                      <DatePicker style={{ width: "100%" }}/>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Date Issued" name="Year_Issued" >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="End of Warranty" name="EndOfWarranty" >
                      <DatePicker style={{ width: "100%" }}/>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Replacement Date" name="ForReplacementYear" >
                      <DatePicker style={{ width: "100%" }}/>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card variant='borderless' >
                <p style={{ fontWeight: 600, letterSpacing: 0.7, fontSize: 15,color: "#1677ff" }}> Addtional Details </p>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Others" name="Others" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Remarks" name="Remarks" >
                      <StyledInput></StyledInput>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

            <Button  block htmlType='submit' loading={isSubmit} style={{ backgroundColor: "#000", color: "#FFF", height: "45px", letterSpacing: 0.7, fontWeight: 600 }}> SUBMIT </Button>
            </Form>
        </Modal>
  )
}

export default EquipmentInvForm