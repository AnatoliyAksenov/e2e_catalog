import { useEffect, useState} from "react";
import { useNavigate, useLocation } from "react-router-dom"

import { useSelector } from 'react-redux'


import { Row, Col, Layout, Typography,   } from 'antd';


const {Content} = Layout;

  const Blacklist = () => {

      const navigate = useNavigate();

      const [blacklist, setBlacklist]  = useState<string[]>([]);
      
  
      const user = useSelector((state: any) => state.user.value);
      //if(user.name == "") navigate('/login')
  
  
      const fetchBlacklist = async () => {
        const response = await fetch(`http://localhost:8000/api/blacklist`);
        const json = await response.json();

        return json;
      }



      useEffect(() => {
        fetchBlacklist().then( (data)  => {
         setBlacklist(data)
          
        }).catch( (err)  =>  {
          console.log(err)
        
        })

      }, [])

      

      return (
        <>
            <Content style={{marginLeft: 20}}>
                <Content>
                  <Typography.Title level={4}>Черный список url</Typography.Title>
                  <p>Эти url не будут использвоаться для поиска данных</p>
                </Content>
      
                <Row style={{width: '100%'}}>
                  <Col span={24} style={{width: '100%'}}>
                    { blacklist.map(  (data:string, index:number)  =>  {
                      return (<Typography.Paragraph> {data} </Typography.Paragraph>)
                    } ) }
                  </Col>
                </Row>
  
            </Content>
        </>
      )

  }

  export default Blacklist;