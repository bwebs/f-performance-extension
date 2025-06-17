application: f_performance_extension {
  label: "F Performance Extension"
  url: "https://localhost:8080/bundle.js"
  entitlements: {
    core_api_methods: ["me", "dashboard", "lookml_model_explore", "merge_query"]
    use_embeds: yes
    use_iframes: yes
  }
}