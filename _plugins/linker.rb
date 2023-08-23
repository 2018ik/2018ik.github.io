module Jekyll
  class AutolinkWordsGenerator < Generator
    def generate(site)
      @existing_paths = site.pages.map { |page| page.url.downcase }
    end
  end

  module AutolinkWordsFilter
    def autolink_words(input)
      words = input.split(/\b/)

      words.map! do |word|
        if word.length > 1 && @existing_paths.include?("/#{word.downcase}/")
          "<a href='/#{word.downcase}/'>#{word}</a>"
        else
          word
        end
      end

      words.join('')
    end
  end
end

Liquid::Template.register_filter(Jekyll::AutolinkWordsFilter)