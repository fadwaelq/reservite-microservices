package com.reservite.hotelservice.dto;

public class HotelDTO {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String country;
    private Double rating;

    // Constructors
    public HotelDTO() {}

    public HotelDTO(Long id, String name, String address, String city, String country, Double rating) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.city = city;
        this.country = country;
        this.rating = rating;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
}