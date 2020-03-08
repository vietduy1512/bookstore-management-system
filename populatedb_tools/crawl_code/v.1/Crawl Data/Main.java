package com.company;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import com.chilkatsoft.*;
import org.xml.sax.SAXException;

public class Main {


    public static void main(String[] args) {
        int id = 208;
        Document doc = null;
        try {
            doc = Jsoup.connect("https://tiki.vn/nha-sach-tiki/c8322?src=mega-menu&page=10").get();

            Elements curDiv = doc.select("div[data-seller-product-id]");

            for(Element elem : curDiv){
                StringBuilder curData = new StringBuilder();
                curData.append("<Sach ");
                curData.append(elem.attributes());
                curData.append(" src=").append('"' + elem.select("img").attr("src") + '"');
                curData.append(" final-price=").append('"' + elem.select("span.final-price").html()+ '"');
                curData.append(" price-regular=").append('"' + elem.select("span.price-regular").html()+ '"');
                curData.append(" sale=").append('"' + elem.select("span.sale-tag-square").html() + '"');

                curData.append(" >");
                System.out.println(curData.toString());

                String fileName = "SACH_"+ id+".xml";
                PrintWriter writer = new PrintWriter(fileName, "UTF-8");
                writer.println(curData.toString());
                writer.close();
                id++;
            }




//            Elements newsHeadlines = doc.select("#mp-itn b a");
//            for (Element headline : newsHeadlines) {
//                //log("%s\n\t%s",
//                headline.attr("title"), headline.absUrl("href"));
//            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        //log(doc.title());


        /*URL url;
        InputStream is = null;
        BufferedReader br;
        String line;
        StringBuilder stringBuilder = new StringBuilder();
        boolean flag = false;
        boolean isHaveTagimg = false;

        try {
            url = new URL("https://tiki.vn/nha-sach-tiki/c8322?src=mega-menu");
            is = url.openStream();  // throws an IOException
            br = new BufferedReader(new InputStreamReader(is));

            while ((line = br.readLine()) != null) {
//                if(line.contains("<div class=\"advisory-posts-box hide\">") && flag){
//                    break;
//                }
//
//                if(line.contains("<!-- end static block -->")) {
//                    flag = true;
//                }
//                else if(flag){
//                    stringBuilder.append(line).append("\n");
//                }
                stringBuilder.append(line).append("\n");
            }
        } catch (MalformedURLException mue) {
            mue.printStackTrace();
        } catch (IOException ioe) {
            ioe.printStackTrace();
        } finally {
            try {
                if (is != null) is.close();
            } catch (IOException ioe) {
                // nothing to see here
            }
        }

        String xmlString = stringBuilder.toString();
        DocumentBuilder builder = null;
        try {
            builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
        }
        Document doc = null;
        try {
            doc = builder.parse(xmlString);
        } catch (SAXException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        doc.getElementById("someId");
        doc.getElementsByTagName("div");
        doc.getChildNodes();
        //System.out.println(xmlString);


//        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
//        DocumentBuilder builder;
//        try {
//            builder = factory.newDocumentBuilder();
//            Document document = builder.parse(new InputSource(new StringReader(xmlString)));
//            System.out.println(document.toString());
//        } catch (Exception e) {
//            e.printStackTrace();
//        }*/

    }
}
