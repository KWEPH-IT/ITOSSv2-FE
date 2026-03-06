import { RingLoader } from "react-spinners";


export const Loader = () => {
  return (
    <div style={styles.loaderContainer}>
        <RingLoader color="#4707cf" size={100}></RingLoader>
    </div>
  )
}

const styles = {
    loaderContainer: {
        display: "flex",
        justifyContent : "center",
        alignItems: "center", 
        height: "100vh", // Full screen height
    }
}

