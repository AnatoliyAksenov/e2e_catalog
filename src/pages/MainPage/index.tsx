import { useState } from 'react';
import { Drawer, Menu, Col, Layout, Flex, Button, Divider } from 'antd';

import {Outlet, Link} from "react-router-dom";
//import { useSelector } from 'react-redux'

import { MenuOutlined, HomeOutlined, AppstoreOutlined, AppstoreAddOutlined, MenuFoldOutlined, CloseCircleOutlined } from  '@ant-design/icons';

//CSS
import './index.css';

const { Content } = Layout;
  
const Sidebar = () => {
    const [visible, setVisible] = useState(false)
    //onst user = useSelector((state: any) => state.user.value);
    

    //const iconStyle = {color: '#A0A0A0', verticalAlign: 'middle'}
  
    return (
      <Content>
        <Col className="main-space">
            <Flex gap='large'>
                <Button type="text" icon={ <MenuOutlined /> } onClick={() => setVisible(true)} />
                <Content onClick={() => setVisible(true)}>
                  <h2><strong style={{color: 'white', backgroundColor: '#A0A0A0', padding: '2px'}}>E2E</strong>Каталог</h2>
                </Content>
            </Flex>
            <Divider />
            <Drawer
              title="E2E Каталог"
              placement='left'
              closable={true}
              open={visible}
              key='left-drawer'
              //closeIcon={CloseIcon}
              onClose={() => setVisible(false)}
            >
          
                <Menu mode="vertical">

                    <Menu.Item key="root" onClick={() => setVisible(false)} icon={<HomeOutlined />}>
                        <Link to="/" style={{paddingLeft: 10}}>Новый запрос</Link>
                    </Menu.Item>

                    <Menu.Item key="dashboards" onClick={() => setVisible(false)} icon={<AppstoreOutlined />}>
                        <Link to="/dashboards" style={{paddingLeft: 10}}>Готовые запросы</Link>
                    </Menu.Item>

                    <Menu.Item key="blacklist" onClick={() => setVisible(false)} icon={<MenuFoldOutlined />}>
                        <Link to="/blacklist" style={{paddingLeft: 10}}>Черный список url</Link>
                    </Menu.Item>

                    <Menu.Item key="closedsources" onClick={() => setVisible(false)} icon={<CloseCircleOutlined />}>
                        <Link to="/closedsources" style={{paddingLeft: 10}}>Закрытые ресурсы</Link>
                    </Menu.Item>

                    <Menu.Item key="rag" onClick={() => setVisible(false)} icon={<AppstoreAddOutlined />}>
                        <Link to="/rag" style={{paddingLeft: 10}}>RAG (в разработке)</Link>
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
  