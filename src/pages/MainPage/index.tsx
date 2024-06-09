import { useState } from 'react';
import { Drawer, Menu, Col, Layout, Flex, Button, Divider } from 'antd';

import {Outlet, Link} from "react-router-dom";
import { useSelector } from 'react-redux'

import { MenuOutlined, HomeOutlined, AppstoreOutlined, AppstoreAddOutlined  } from  '@ant-design/icons';

//CSS
import './index.css';

const { Content } = Layout;
  
const Sidebar = () => {
    const [visible, setVisible] = useState(false)
    const user = useSelector((state: any) => state.user.value);
    

    const iconStyle = {color: '#A0A0A0', verticalAlign: 'middle'}
  
    return (
      <Content>
        <Col className="main-space">
            <Flex gap='large'>
                <Button type="text" icon={ <MenuOutlined /> } onClick={() => setVisible(true)} />
                <Content onClick={() => setVisible(true)}>
                  <h2><strong style={{color: 'white', backgroundColor: '#A0A0A0', padding: '2px'}}>E2E</strong>Catalog</h2>
                </Content>
            </Flex>
            <Divider />
            <Drawer
              title="Welcome to E2E Catalog"
              placement='left'
              closable={true}
              open={visible}
              key='left-drawer'
              //closeIcon={CloseIcon}
              onClose={() => setVisible(false)}
            >
          
                <Menu mode="vertical">

                    <Menu.Item key="1" onClick={() => setVisible(false)} icon={<HomeOutlined />}>
                        <Link to="/" style={{paddingLeft: 10}}>Home</Link>
                    </Menu.Item>

                    <Menu.Item key="2" onClick={() => setVisible(false)} icon={<AppstoreOutlined />}>
                        <Link to="/dashboards" style={{paddingLeft: 10}}>Collection</Link>
                    </Menu.Item>

                    <Menu.Item key="new_dashboard" onClick={() => setVisible(false)} icon={<AppstoreAddOutlined />}>
                        <Link to="/new_dashboard" style={{paddingLeft: 10}}>New Dashboard</Link>
                    </Menu.Item>

                </Menu>

            </Drawer>

              <div style={{width: '100%', height: 'calc(100%)'}}>
                <Outlet />
              </div>

          
        </Col>

      </Content>
    )
  }
  
  export default Sidebar
  