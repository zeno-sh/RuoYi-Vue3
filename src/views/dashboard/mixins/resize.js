// useResize.js
import { onMounted, onUnmounted, ref } from 'vue';
import { debounce } from '@/utils';

export function useResize(chartRef) {
  const sidebarElm = ref(null);

  const resizeHandler = debounce(() => {
    if (chartRef.value) {
      chartRef.value.resize();
    }
  }, 100);

  const sidebarResizeHandler = (e) => {
    if (e.propertyName === 'width') {
      resizeHandler();
    }
  };

  onMounted(() => {
    window.addEventListener('resize', resizeHandler);
    sidebarElm.value = document.getElementsByClassName('sidebar-container')[0];
    sidebarElm.value && sidebarElm.value.addEventListener('transitionend', sidebarResizeHandler);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler);
    sidebarElm.value && sidebarElm.value.removeEventListener('transitionend', sidebarResizeHandler);
  });

  return {
    resize: resizeHandler
  };
}
