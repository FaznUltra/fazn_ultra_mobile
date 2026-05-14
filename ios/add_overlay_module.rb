gems_dir = '/usr/local/Cellar/cocoapods/1.16.2_2/libexec/gems'
%w[xcodeproj-1.27.0/lib claide-1.1.0/lib nanaimo-0.4.0/lib atomos-0.1.3/lib].each do |p|
  $LOAD_PATH.unshift("#{gems_dir}/#{p}")
end
require 'xcodeproj'

project_path = File.expand_path('../mobile.xcodeproj', __FILE__)
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == 'mobile' }
raise "Target 'mobile' not found" unless target

# Remove any stale references to ScreenOverlayModule files
target.source_build_phase.files.each do |bf|
  if bf.file_ref&.path&.include?('ScreenOverlayModule')
    puts "Removing stale ref: #{bf.file_ref.path}"
    bf.remove_from_project
  end
end
project.objects.select { |o| o.isa == 'PBXFileReference' && o.path&.include?('ScreenOverlayModule') }.each do |ref|
  puts "Removing orphan file ref: #{ref.path}"
  ref.remove_from_project
end

# Find the mobile app group (files live in ios/mobile/)
app_group = project.main_group.find_subpath('mobile', false)
raise "Group 'mobile' not found" unless app_group

# Add the files now in ios/mobile/ — path relative to the group
['ScreenOverlayModule.swift', 'ScreenOverlayModule.m'].each do |file_name|
  file_ref = app_group.new_file(file_name)
  target.source_build_phase.add_file_reference(file_ref)
  puts "Added #{file_name}"
end

# Ensure bridging header build setting is set
['Debug', 'Release'].each do |config_name|
  config = target.build_configurations.find { |c| c.name == config_name }
  next unless config
  if config.build_settings['SWIFT_OBJC_BRIDGING_HEADER'].nil? || config.build_settings['SWIFT_OBJC_BRIDGING_HEADER'].empty?
    config.build_settings['SWIFT_OBJC_BRIDGING_HEADER'] = 'mobile/mobile-Bridging-Header.h'
    puts "Set bridging header for #{config_name}"
  end
end

project.save
puts "Done — project saved."
