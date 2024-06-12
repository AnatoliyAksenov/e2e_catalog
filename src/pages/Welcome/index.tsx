import {useState, useRef} from'react'
import {Layout, Button, Modal, Input, Checkbox, Slider, Form, Upload,  UploadFile} from 'antd'
import { useNavigate } from "react-router-dom"

const {Content} = Layout

interface Config{
    visible: boolean
    use_internet?: boolean
}

const Welcome = () => {
    const navigate = useNavigate()

    const [config, setConfig]  =  useState<Config>({visible: false})
    const [inputs, setInputs]   =  useState({question: '', temperature: 5})
    const [items, setItems] = useState<any[]>([])

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const upload = useRef<typeof Upload>(null)
    const [form] =   Form.useForm()

    const [questionTheme, setQuestionTheme] = useState('Финансы')

    const fetchNewQuestion  =  async ()  =>  {

        const init = {
            method: "POST", 
            body: JSON.stringify({
                question: inputs.question,
                temperature: inputs.temperature,
                use_internet: config.use_internet,
                files: fileList.map((file) => file.response.key)

            })
        }
        
        const response  = await fetch(`http://localhost:8000/api/process_query`, init );
        const json  = await response.json();

        return json;
    }



    const onUploadChange = (info:any) => {
        console.log("onUploadChange: ", info);
        setFileList([...info.fileList]);
      };

    const onOk = () => {
        fetchNewQuestion().then((data)  => {
            setItems([...items,data as any])
            setConfig({...config, visible: false}); 
        }).catch( (error:any) => {
            console.log(error);
        }).finally(()=> {
            console.log('New Question finally')
        })
        
    }

    return (
        <>
            <Content>
                <h1>Welcome to the App</h1>
                <Button onClick={ () => {
                    navigate('/new_dashboard',{state:{id: 5}})
                }}> Go to 5th dashboard!</Button>
                <Button onClick={ () => {
                    navigate('/new_dashboard',{state:{id: 6}})
                }}> Go to 6th dashboard!</Button>
                <Button onClick={ () => {
                    navigate('/new_dashboard',{state:{id: 7}})
                }}> Go to 7th dashboard!</Button><br />
                <Button onClick={ ()  =>  { setConfig({...config, visible: true}) }}> new question</Button>

            </Content>
            <Modal title="New question" open={config.visible} onOk={ onOk } okText="Run" destroyOnClose={false} onCancel={ () =>{ setConfig({...config, visible: false}) }} cancelText="CLose" width={650}>
                <Form layout='horizontal'>
                    <Form.Item label="Question" labelCol={{span: 6}}   >
                    <Input placeholder="Enter your question" onChange={ (e:any) => setInputs({...inputs, question: e.target.value})}/>      
                    </Form.Item>
                    
                    <Form.Item label="Use Internet search"  labelCol={{span: 6}} >
                    <Checkbox value={false} onChange={( e:any)  => setConfig({...config, use_internet: e.target.value}) }> Use Internet search</Checkbox>
                    </Form.Item>
    
                    <Form.Item label="Themperature"  labelCol={{span: 6}} >
                      <Slider min={0.1} max={1} step={0.1} onChange={(e:any)  => setInputs({...inputs, temperature: e}) } defaultValue={.5} />
                    </Form.Item>

                    <Form.Item label="Text files" getValueFromEvent={(e:any)   => setFileList(e.fileList)  }>
                        <Upload accept='application/docx' action='http://localhost:8000/api/uploadfile/' ref={upload} onChange={onUploadChange}> PDF or DOCX files</Upload>
                    </Form.Item>

                </Form>
            </Modal>
        </>
    )
}

export default Welcome