#
# Put your custom functions in this class in order to keep the files under lib untainted
#
# This class has access to all of the private variables in deploy/lib/server_config.rb
#
# any public method you create here can be called from the command line. See
# the examples below for more information.
#
require 'rexml/document'
include REXML

class ServerConfig

  def initialize_xquerrail
    logger.info "Refresh XQuerrail Caches..."
    r = go %Q{http://#{@hostname}:#{@properties["ml.app-port"]}/initialize.xqy}, "get"
    if r.code.to_i != 200
      logger.error "#{r.body}"
    else
      return true
    end
  end

  def update_config_xquerrail
    file_name = "#{@properties["ml.xquery.dir"]}/main/_config/config.xml"
    config = File.read(file_name)
    new_config = config.gsub(/<anonymous-user value="([\w-]+)"\/>/, "<anonymous-user value=\"#{@properties["ml.default-user"]}\"/>")
    logger.debug new_config
    # To write changes to the file, use:
    File.open(file_name, "w") {|file| file.puts new_config }
  end

  def build_indexes()
    # since we are monkey patching we have access to the private methods
    # in ServerConfig
    r = go %Q{http://#{@hostname}:#{@properties["ml.app-port"]}/initialize-database.xqy}, "get"
    if r.code.to_i != 200
      logger.error "#{r.body}"
    else
      xmldoc = REXML::Document.new(r.body)
      range_element_indexes = XPath.match(xmldoc, "/initialize-database/db:range-element-index", { "db"=>"http://marklogic.com/xdmp/database" })
      range_element_attribute_indexes = XPath.match(xmldoc, "/initialize-database/db:range-element-attribute-index", { "db"=>"http://marklogic.com/xdmp/database" })
      range_field_indexes = XPath.match(xmldoc, "/initialize-database/db:range-field-index", { "db"=>"http://marklogic.com/xdmp/database" })
      path_namespaces = XPath.match(xmldoc, "/initialize-database/db:path-namespace", { "db"=>"http://marklogic.com/xdmp/database" })
      range_path_indexes = XPath.match(xmldoc, "/initialize-database/db:range-path-index", { "db"=>"http://marklogic.com/xdmp/database" })
      if not range_element_indexes.empty?
        @properties["ml.range-element-index-xml"] = range_element_indexes.join("\n")
      end
      if not range_element_attribute_indexes.empty?
        @properties["ml.range-element-attribute-index-xml"] = range_element_attribute_indexes.join("\n")
      end
      if not range_field_indexes.empty?
        @properties["ml.range-field-index-xml"] = range_field_indexes.join("\n")
      end
      if not path_namespaces.empty?
        @properties["ml.path-namespace-xml"] = path_namespaces.join("\n")
      end
      if not range_path_indexes.empty?
        @properties["ml.range-path-index-xml"] = range_path_indexes.join("\n")
      end
      bootstrap
    end
  end

  #
  # You can easily "override" existing methods with your own implementations.
  # In ruby this is called monkey patching
  #
  # first you would rename the original method
  # alias_method :original_deploy_modules, :deploy_modules

  # then you would define your new method
  # def deploy_modules
  #   # do your stuff here
  #   # ...

  #   # you can optionally call the original
  #   original_deploy_modules
  # end

  #
  # you can define your own methods and call them from the command line
  # just like other roxy commands
  # ml local my_custom_method
  #
  # def my_custom_method()
  #   # since we are monkey patching we have access to the private methods
  #   # in ServerConfig
  #   @logger.info(@properties["ml.content-db"])
  # end

  #
  # to create a method that doesn't require an environment (local, prod, etc)
  # you woudl define a class method
  # ml my_static_method
  #
  # def self.my_static_method()
  #   # This method is static and thus cannot access private variables
  #   # but it can be called without an environment
  # end
end

#
# Uncomment, and adjust below code to get help about your app_specific
# commands included into Roxy help. (ml -h)
#

#class Help
#  def self.app_specific
#    <<-DOC.strip_heredoc
#
#      App-specific commands:
#        example       Installs app-specific alerting
#    DOC
#  end
#
#  def self.example
#    <<-DOC.strip_heredoc
#      Usage: ml {env} example [args] [options]
#      
#      Runs a special example task against given environment.
#      
#      Arguments:
#        this    Do this
#        that    Do that
#        
#      Options:
#        --whatever=value
#    DOC
#  end
#end
