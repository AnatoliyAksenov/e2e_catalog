import {Layout, Button} from 'antd'
import { useNavigate } from "react-router-dom"

const {Content} = Layout



const Welcome = () => {
    const navigate = useNavigate()

    return (
        <Content>
            <h1>Welcome to the App</h1>
            <Button onClick={ () => {
                navigate('/new_dashboard',{state:{id: 5}})
            }}> Go to 5th dashboard!</Button>
        </Content>

    )
}

export default Welcome