<template>
  <router-view></router-view>
</template>

<script setup>
</script>

<style>
:root {
  --brand-primary: #4F46E5;    
  --brand-hover: #4338CA;      
  --brand-light: #EEF2FF;     
  --bg-app: #F8FAFC;           
  --text-main: #1E293B;       
  --text-muted: #64748B;      
  --card-bg: #FFFFFF;          
  
  /* Colores de estado */
  --success: #10B981;
  --success-bg: #D1FAE5;
  --warning: #F59E0B;
  --warning-bg: #FEF3C7;
  --danger: #EF4444;
  --danger-bg: #FEE2E2;

  /* Formas y sombras */
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-app);
  color: var(--text-main);
  -webkit-font-smoothing: antialiased;
}
</style>