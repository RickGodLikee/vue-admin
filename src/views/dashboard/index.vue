<template>
  <div class="temperature-chart-container">
    <!-- 顶部控制栏 -->
    <div class="chart-header">
      <div class="header-left">
        <h3>房间温度监控系统</h3>
        <span class="time-display">{{ currentTime }}</span>
      </div>
      <div class="header-right">
        <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
          <el-radio-button label="6h">6小时</el-radio-button>
          <el-radio-button label="12h">12小时</el-radio-button>
          <el-radio-button label="24h">24小时</el-radio-button>
          <el-radio-button label="7d">7天</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
    </div>

    <!-- 房间选择区域 -->
    <div class="room-selector">
      <div class="selector-title">
        <span>选择要查看的房间（已选择 {{ selectedRooms.length }} 个房间）</span>
        <div class="selector-actions">
          <el-button link type="primary" @click="selectAllRooms">全选</el-button>
          <el-button link type="primary" @click="selectRecommended">推荐(前4个)</el-button>
          <el-button link @click="clearAllRooms">清空</el-button>
        </div>
      </div>
      <div class="room-grid">
        <div 
          v-for="room in rooms" 
          :key="room.id"
          class="room-item"
          :class="{
            selected: selectedRooms.includes(room.id),
            disabled: selectedRooms.length >= 6 && !selectedRooms.includes(room.id)
          }"
          @click="toggleRoom(room.id)"
        >
          <div class="room-color" :style="{ backgroundColor: getRoomColor(room.id) }"></div>
          <span class="room-name">{{ room.name }}</span>
          <el-icon v-if="selectedRooms.includes(room.id)" class="check-icon"><Check /></el-icon>
        </div>
      </div>
    </div>

    <!-- 图表容器 -->
    <div ref="chartRef" class="chart-container"></div>

    <!-- 统计信息卡片 -->
    <div v-if="selectedRooms.length > 0" class="stats-cards">
      <el-card v-for="roomId in selectedRooms" :key="roomId" class="stats-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>{{ getRoomName(roomId) }}</span>
            <el-tag size="small" :color="getRoomColor(roomId)" style="color: white">实时</el-tag>
          </div>
        </template>
        <div class="stats-content">
          <div class="stat-item">
            <span class="stat-label">室内温度</span>
            <span class="stat-value indoor">{{ getLatestTemp(roomId, 'indoor') }}°C</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">室外温度</span>
            <span class="stat-value outdoor">{{ getLatestTemp(roomId, 'outdoor') }}°C</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">温差</span>
            <span class="stat-value diff">{{ getTempDiff(roomId) }}°C</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Refresh, Check } from '@element-plus/icons-vue'

// 图表实例和容器引用
const chartRef = ref(null)
let chartInstance = null

// 当前时间显示
const currentTime = ref('')
setInterval(() => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  })
}, 1000)

// 时间范围
const timeRange = ref('24h')

// 房间数据
const rooms = ref([
  { id: 1, name: '会议室A', floor: '3F', type: '会议室' },
  { id: 2, name: '会议室B', floor: '3F', type: '会议室' },
  { id: 3, name: '办公室C', floor: '4F', type: '办公室' },
  { id: 4, name: '办公室D', floor: '4F', type: '办公室' },
  { id: 5, name: '实验室E', floor: '5F', type: '实验室' },
  { id: 6, name: '实验室F', floor: '5F', type: '实验室' },
  { id: 7, name: '服务器室G', floor: '1F', type: '机房' },
  { id: 8, name: '服务器室H', floor: '1F', type: '机房' }
])

// 选中的房间
const selectedRooms = ref([1, 2, 3, 4])

// 颜色配置
const colors = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666',
  '#73c0de', '#3ba272', '#fc8452', '#9a60b4'
]

// 获取房间颜色
const getRoomColor = (roomId) => {
  const index = rooms.value.findIndex(r => r.id === roomId)
  return colors[index % colors.length]
}

// 获取房间名称
const getRoomName = (roomId) => {
  return rooms.value.find(r => r.id === roomId)?.name || ''
}

// 所有房间数据存储
const allRoomData = ref({})

// 生成模拟数据
const generateRoomData = (roomId, range = '24h') => {
  const points = range === '6h' ? 60 : range === '12h' ? 120 : range === '24h' ? 240 : 168 // 7天每小时一个点
  const times = []
  const now = Date.now()
  
  let timeStep = 3600000 // 默认1小时
  if (range === '6h') timeStep = 360000 // 6分钟
  else if (range === '12h') timeStep = 360000 // 6分钟
  else if (range === '24h') timeStep = 360000 // 6分钟
  else timeStep = 3600000 // 1小时
  
  for (let i = 0; i < points; i++) {
    times.push(now - (points - 1 - i) * timeStep)
  }

  // 根据房间类型生成不同的温度模式
  const room = rooms.value.find(r => r.id === roomId)
  let indoorBase = 22
  let outdoorBase = 18
  let indoorVariation = 2
  let outdoorVariation = 5
  
  if (room?.type === '机房') {
    indoorBase = 24 // 机房温度较高
    indoorVariation = 1 // 更稳定
  } else if (room?.type === '实验室') {
    indoorBase = 21
    indoorVariation = 3
  }

  // 室内温度
  const indoorTemps = times.map((_, index) => {
    const baseTemp = indoorBase + Math.sin(index / 10) * indoorVariation
    return (baseTemp + (Math.random() * 0.3 - 0.15)).toFixed(1)
  })

  // 室外温度（考虑昼夜变化）
  const outdoorTemps = times.map((time) => {
    const hour = new Date(time).getHours()
    // 一天中温度变化：凌晨低，下午高
    const dailyVar = Math.sin((hour - 6) * Math.PI / 12) * 4
    const baseTemp = outdoorBase + dailyVar
    return (baseTemp + (Math.random() * 0.5 - 0.25)).toFixed(1)
  })

  return {
    roomId,
    times,
    indoorTemps,
    outdoorTemps
  }
}

// 初始化所有房间数据
const initAllRoomData = () => {
  rooms.value.forEach(room => {
    allRoomData.value[room.id] = generateRoomData(room.id, timeRange.value)
  })
}
initAllRoomData()

// 获取最新温度
const getLatestTemp = (roomId, type) => {
  const data = allRoomData.value[roomId]
  if (!data) return '--'
  const temps = type === 'indoor' ? data.indoorTemps : data.outdoorTemps
  return temps[temps.length - 1]
}

// 获取温差
const getTempDiff = (roomId) => {
  const indoor = parseFloat(getLatestTemp(roomId, 'indoor'))
  const outdoor = parseFloat(getLatestTemp(roomId, 'outdoor'))
  if (isNaN(indoor) || isNaN(outdoor)) return '--'
  return (indoor - outdoor).toFixed(1)
}

// 切换房间选择
const toggleRoom = (roomId) => {
  if (selectedRooms.value.includes(roomId)) {
    selectedRooms.value = selectedRooms.value.filter(id => id !== roomId)
  } else {
    if (selectedRooms.value.length >= 8) {
      ElMessage.warning('最多只能选择8个房间')
      return
    }
    selectedRooms.value.push(roomId)
  }
  updateChart()
}

// 全选房间
const selectAllRooms = () => {
  selectedRooms.value = rooms.value.map(r => r.id)
  updateChart()
}

// 选择推荐房间
const selectRecommended = () => {
  selectedRooms.value = [1, 2, 3, 4]
  updateChart()
}

// 清空所有选择
const clearAllRooms = () => {
  selectedRooms.value = []
  updateChart()
}

// 处理时间范围变化
const handleTimeRangeChange = (val) => {
  // 重新生成数据
  rooms.value.forEach(room => {
    allRoomData.value[room.id] = generateRoomData(room.id, val)
  })
  updateChart()
}

// 刷新数据
const refreshData = () => {
  ElMessage.success('数据已刷新')
  handleTimeRangeChange(timeRange.value)
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  window.addEventListener('resize', handleResize)
  updateChart()
}

// 处理窗口大小变化
const handleResize = () => {
  chartInstance?.resize()
}

// 更新图表
const updateChart = () => {
  if (!chartInstance) return

  if (selectedRooms.value.length === 0) {
    chartInstance.setOption({
      title: {
        text: '请选择要查看的房间',
        left: 'center',
        top: 'center',
        textStyle: { color: '#909399' }
      },
      xAxis: { data: [] },
      yAxis: {},
      series: []
    })
    return
  }

  const series = []
  
  selectedRooms.value.forEach((roomId) => {
    const roomData = allRoomData.value[roomId]
    const room = rooms.value.find(r => r.id === roomId)
    const color = getRoomColor(roomId)
    
    // 室内温度曲线
    series.push({
      name: `${room.name} 室内`,
      type: 'line',
      data: roomData.indoorTemps,
      symbol: 'none',
      lineStyle: { color, width: 2, type: 'solid' },
      smooth: true,
      emphasis: { focus: 'series' }
    })
    
    // 室外温度曲线
    series.push({
      name: `${room.name} 室外`,
      type: 'line',
      data: roomData.outdoorTemps,
      symbol: 'none',
      lineStyle: { color, width: 1.5, type: 'dashed' },
      smooth: true,
      emphasis: { focus: 'series' }
    })
  })

  const xAxisData = allRoomData.value[selectedRooms.value[0]]?.times.map(t => {
    const date = new Date(t)
    if (timeRange.value === '7d') {
      return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:00`
    } else {
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`
    }
  }) || []

  const option = {
    title: { text: '房间温度曲线', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params) => {
        let result = params[0].axisValue + '<br/>'
        const rooms = {}
        params.forEach(p => {
          const [roomName, type] = p.seriesName.split(' ')
          if (!rooms[roomName]) rooms[roomName] = {}
          rooms[roomName][type] = p.value
        })
        Object.keys(rooms).forEach(name => {
          result += `<div style="margin-top:5px"><b>${name}</b><br/>`
          result += `室内: ${rooms[name]['室内']}°C | 室外: ${rooms[name]['室外']}°C</div>`
        })
        return result
      }
    },
    legend: { 
      type: 'scroll', 
      top: 30,
      data: series.map(s => s.name)
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: 80, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLabel: { rotate: timeRange.value === '7d' ? 30 : 0 }
    },
    yAxis: {
      type: 'value',
      name: '温度 (°C)',
      min: 10,
      max: 35,
      axisLabel: { formatter: '{value} °C' }
    },
    series,
    dataZoom: [{ type: 'slider', start: 0, end: 100 }]
  }
  
  chartInstance.setOption(option)
}

// 监听选中房间变化
watch(selectedRooms, () => updateChart(), { deep: true })

// 生命周期
onMounted(() => initChart())

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
.temperature-chart-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.header-left h3 {
  margin: 0 0 5px 0;
  color: #303133;
}

.time-display {
  font-size: 14px;
  color: #909399;
}

.header-right {
  display: flex;
  gap: 10px;
}

.room-selector {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.selector-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  color: #606266;
}

.selector-actions {
  display: flex;
  gap: 10px;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.room-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.room-item:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.room-item.selected {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.room-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.room-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 8px;
}

.room-name {
  flex: 1;
  font-size: 14px;
}

.check-icon {
  color: #409eff;
  font-size: 16px;
}

.chart-container {
  width: 100%;
  height: 500px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stats-card {
  background: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #909399;
  font-size: 13px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
}

.stat-value.indoor {
  color: #5470c6;
}

.stat-value.outdoor {
  color: #91cc75;
}

.stat-value.diff {
  color: #ee6666;
}
</style>