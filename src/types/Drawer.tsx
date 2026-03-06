export interface DrawerProps{
    isDrawerOpen: boolean,
    drawerMode: "add" | "edit",
    closeDrawer: () => void, 
    onUserAction: () => void
}

export interface ModalProps{
    isModalOpen: boolean,
    closeModal: () => void,
    onUserAction: () => void
}