import { useEffect,  useState} from "react";
//import { useNavigate } from "react-router-dom"
//import { useSelector } from 'react-redux'


import {  Row, Col, Layout,  Typography,  } from 'antd';



const {Content} = Layout;



interface Config{
  data: any,
}

const ClosedSources = () => {

      //const navigate = useNavigate();

      //const user = useSelector((state: any) => state.user.value);
      //if(user.name == "") navigate('/login')
  

      const [config, setConfig]  = useState<Config>({} as Config);

  
      const fetchClosedSources = async () => {
        const response = await fetch(`/api/closed_sources`);
        const json = await response.json();

        return json;
      }

      useEffect(() => {
        fetchClosedSources().then( (data)  => {
          setConfig({...config, data: data});
          
        }).catch( (err)  =>  {
          console.log(err)
        
        })

      }, [])

      

      return (
        <>
          <Content style={{marginLeft: 20}}>
              <Content>
                <Typography.Title level={4}>Закрытые источники</Typography.Title>
              </Content>
    
              <Row style={{width: '100%'}}>
                <Col span={24} style={{width: '100%'}}>
                { config.data.map(  (data:any, _index:number)  =>  {
                    return (<Typography.Paragraph> {data.url} </Typography.Paragraph>)
                  } ) }
                </Col>
              </Row>

          </Content>
        </>
      )

  }

  export default ClosedSources;