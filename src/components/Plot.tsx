
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
         Tooltip, ResponsiveContainer, LineChart, Line, 
         BarChart, Bar, Legend, Area, AreaChart,
         Pie, PieChart, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

import * as d3 from 'd3';

export interface PlotParams {
    data: object[],
    x: string,
    y: string,
    ys?: string[],
    name?: string,
    chart_type?: string,
    height?: number
}


const Plot = ( params: PlotParams ) => {
    const chart_type = params.chart_type || 'scatter_chart';
    const name = params.name || '';
    const height = params.height || 400;

    const colors = d3.schemeSpectral[7];

    switch (chart_type){
        case 'scatter_chart':
            return (
              <ResponsiveContainer width="100%" height={height}>
                <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 20, }}>
                  <CartesianGrid />
                  <XAxis type="category" dataKey={params.x} name={params.x} />
                  <YAxis type="number" dataKey={params.y} name={params.y} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name={name} data={params.data} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            );
        case 'line_chart':
            return (<ResponsiveContainer width="100%" height={height}>
                        <LineChart data={params.data}>
                            <XAxis dataKey={params.x} name={params.x} />
                            <YAxis dataKey={params.y} name={params.y} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Legend />
                            <Line type="monotone" dataKey={params.y} stroke="#8884d8" fill="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>);
        case 'multi_line_chart':
            const ys = params.ys?.map( y => <Line type="monotone" dataKey={y} stroke="#8884d8" fill="#8884d8" /> );
            return (<ResponsiveContainer width="100%" height={height}>
                        <LineChart data={params.data}>
                            <XAxis dataKey={params.x} name={params.x} />
                            <YAxis dataKey={params.y} name={params.y} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Legend />
                            {ys}
                        </LineChart>
                    </ResponsiveContainer>);
        case 'bar_chart':
            return (<ResponsiveContainer width="100%" height={height}>
                        <BarChart data={params.data}>
                            <XAxis dataKey={params.x} name={params.x} />
                            <YAxis dataKey={params.y} name={params.y} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Legend />
                            <Bar dataKey={params.y} stackId="a" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>);
        case 'area_chart':
            return (<ResponsiveContainer width="100%" height={height}>
                <AreaChart data={params.data}>
                    <XAxis dataKey={params.x} name={params.x} />
                    <YAxis dataKey={params.y} name={params.y} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Area type="monotone" dataKey={params.y} stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
            </ResponsiveContainer>);
        case 'pie_chart':
            return (<ResponsiveContainer width="100%" height={height}>
                <PieChart width={400} height={400}>
                    <Pie dataKey={params.y} data={params.data} nameKey={params.x} fill="#8884d8" label>
                        {params.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>);
        case 'donut_chart':
            return (<ResponsiveContainer width="100%" height={height}>
                <PieChart width={400} height={400}>
                    <Pie dataKey={params.y} data={params.data} nameKey={params.x} fill="#8884d8" label radius={100} innerRadius={70}>
                        {params.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>);
        case 'radar_chart':
            return(<ResponsiveContainer width="100%" height={height}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={params.data}>
              <PolarGrid />
              <PolarAngleAxis dataKey={params.x} />
              <PolarRadiusAxis />
              <Radar name="Mike" dataKey={params.y} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>)
            
    }  
}

export default Plot;