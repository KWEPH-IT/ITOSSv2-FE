import React, { useState } from 'react';
import { Modal, Row, Col } from 'antd';
import { StyledSelect } from '../../../components/StyledComponents';
import { TicketAssignment } from '../../../types/TicketsCateg_drawer';
import { useTicketAssignment } from '../../../hooks/ticketing/ticketing_assignment.hooks';
import { useAuth } from '../../../context/AuthContext';


interface TicketAssignmentModalProps {
    isModalOpen: boolean;
    closeDrawer: () => void;
    record: any;
    ticket_no: string;
    refetch: () => Promise<void>;
}

const TicketAssignmentModal: React.FC<TicketAssignmentModalProps> = ({isModalOpen, closeDrawer, record, ticket_no, refetch}) => {
    const [ assignedTo, setAssignedTo ] = useState({empId: "", name: "", email: "" });
    const { userId } = useAuth();

    const assignment = record?.[0]?.assignments;


    const { handleAssignment, isLoading } = useTicketAssignment({
        userId: userId ?? undefined,
        refetch,
        onSuccess: closeDrawer,
    });


    const onOk = () => {
        if (!assignedTo.empId) return;
    
        handleAssignment({
            ticket_no: ticket_no,
            categoryName: record?.[0]?.Name,
            assignedToId: assignedTo.empId,
            assignedToName: assignedTo.name,
            assignedToEmail: assignedTo.email,
        });
    };

  return (
    <Modal
            title="Ticket Assignment"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={isModalOpen}
            onOk={onOk}
            confirmLoading={isLoading}
            onCancel={closeDrawer}>
           
           <Row>
                <Col span={24}>
                    <StyledSelect<string> style={{ width: "100%", fontSize: "12px" }} placeholder="Please select ..." 
                         onChange={(value) => {
                            const emp = assignment.find((e: TicketAssignment) => e.AssignmentId === value);
                                setAssignedTo({empId: emp?.AssignmentId ?? "", name: emp?.AssignmentName ?? "", email: emp?.AssignmentEmail ?? ""})
                            }} 
                        >
                        {assignment 
                            .map((emp: TicketAssignment, index : number) => (
                            <StyledSelect.Option 
                                key={index + 1}
                                value={emp.AssignmentId}
                                style={{ fontSize: "12px" , letterSpacing: 0.7 }}
                            >
                                {emp.AssignmentName}
                            </StyledSelect.Option>
                        ))}
                    </StyledSelect>
                </Col>
            </Row>

           
    </Modal> 
  )
}

export default TicketAssignmentModal