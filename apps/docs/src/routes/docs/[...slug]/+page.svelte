<script lang="ts">
  let { data } = $props();
  const Component = $derived(data.component);
</script>

<Component />
