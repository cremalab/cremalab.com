module VideoHelper
  def video_tag(filename)
    types = [
      {extension: "mp4", type: "video/mp4; codecs=avc1.42E01E,mp4a.40.2"},
      {extension: "webm", type: "video/webm; codecs=vp8,vorbis"},
      {extension: "ogv", type: "video/ogg; codecs=theora,vorbis"}
    ]
    content_tag(:video, loop: true, autoplay: true, class: "background", autobuffer: true) do
      types.each do |video|
        concat tag(:source, src: "/video/#{filename}.#{video[:extension]}", type: video[:type])
      end
    end
  end
end